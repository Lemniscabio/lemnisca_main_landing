"""
fermentation_toolkit.py
=======================
Reusable functions for fed-batch fermentation data analysis.
Designed for S. cerevisiae carotenoid production but applicable
to any fed-batch process with OD, WCW, pO2, and feed rate data.

Usage:
    from fermentation_toolkit import (
        load_batch_data, load_metadata,
        reconstruct_volume, compute_dcw,
        compute_mu, savgol_smooth,
        segment_growth_phases,
        compute_carbon_balance, estimate_glucose_concentration,
        estimate_our, estimate_kla
    )
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional


# =============================================================================
# SECTION 1: DATA LOADING
# =============================================================================

def load_batch_data(filepath: str) -> pd.DataFrame:
    """Load batch time-course data from CSV.

    Expected columns: Batch, Equipment, Spectrophotometer, Scale_L,
                      Time_h, OD600, WCW_mg3mL, pO2_pct, Feed_Rate, Feed_Unit
    """
    df = pd.read_csv(filepath)
    # Ensure numeric types
    for col in ['Scale_L', 'Time_h', 'OD600', 'WCW_mg3mL', 'pO2_pct', 'Feed_Rate']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df


def load_metadata(filepath: str) -> pd.DataFrame:
    """Load batch metadata (feed segments, supplements, events) from CSV.

    Expected columns: Table, Batch, Start_h, End_h, Type, Rate_or_Volume, Unit, Description
    """
    df = pd.read_csv(filepath)
    for col in ['Start_h', 'End_h', 'Rate_or_Volume']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df


# =============================================================================
# SECTION 2: VOLUME RECONSTRUCTION
# =============================================================================

def get_feed_rate_at_time(t: float, batch: str, metadata: pd.DataFrame) -> float:
    """Get the feed rate (mL/h) at a given time for a given batch.

    For B01-B03 (mL/L/h units), returns the rate in mL/L/h — the caller
    must multiply by current volume in L to get absolute mL/h.
    For B04-B06 (mL/h units), returns absolute mL/h directly.
    """
    feed_segs = metadata[(metadata['Table'] == 'feed_segment') &
                         (metadata['Batch'] == batch)].sort_values('Start_h')
    for _, seg in feed_segs.iterrows():
        if seg['Start_h'] <= t < seg['End_h']:
            return float(seg['Rate_or_Volume'])
    # If past all segments, return 0
    return 0.0


def get_supplements_between(t_start: float, t_end: float, batch: str,
                            metadata: pd.DataFrame) -> float:
    """Get total supplement volume (mL) added between t_start and t_end.

    Includes tocopherol, IPM, amino acids, glucose pulses —
    anything that adds liquid volume to the reactor.
    """
    supps = metadata[(metadata['Table'] == 'supplement') &
                     (metadata['Batch'] == batch)]
    mask = (supps['Start_h'] > t_start) & (supps['Start_h'] <= t_end)
    return float(supps.loc[mask, 'Rate_or_Volume'].sum())


def reconstruct_volume(batch_df: pd.DataFrame, metadata: pd.DataFrame,
                       params: dict) -> pd.DataFrame:
    """Reconstruct reactor volume at each sampling timepoint.

    Algorithm:
    - Start with V_initial (from batch medium)
    - At each interval [t_i, t_{i+1}]:
      - Integrate feed addition over the interval
      - Add supplement volumes added in the interval
      - Subtract sampling loss (params['sample_volume_mL'] per timepoint)

    For B01-B03 (feed in mL/L/h):
      Feed is volume-normalized. actual_feed_mL/h = rate_mL_L_h * V_current_L
      This creates a coupled ODE. We approximate by using V at start of interval.

    For B04-B06 (feed in mL/h):
      Feed rate is absolute. Direct integration.

    Returns: copy of batch_df with added columns:
      - Volume_mL: reactor volume at each timepoint
      - Cumul_Feed_mL: cumulative feed volume added
      - Cumul_Supplement_mL: cumulative supplement volume added
    """
    df = batch_df.copy().sort_values('Time_h').reset_index(drop=True)
    batch = df['Batch'].iloc[0]
    feed_unit = df['Feed_Unit'].iloc[0]

    # Look up per-batch initial volume: batch medium + inoculum
    # Falls back to Scale_L * 1000 if not specified in params
    v_initial_map = params.get('V_initial_mL', {})
    if batch in v_initial_map:
        V_initial = v_initial_map[batch]
    else:
        V_initial = df['Scale_L'].iloc[0] * 1000  # fallback

    sample_vol = params.get('sample_volume_mL', 3.0)

    volumes = np.zeros(len(df))
    cumul_feed = np.zeros(len(df))
    cumul_supp = np.zeros(len(df))

    volumes[0] = V_initial
    cumul_feed[0] = 0.0
    cumul_supp[0] = 0.0

    for i in range(1, len(df)):
        t_prev = df.loc[i-1, 'Time_h']
        t_curr = df.loc[i, 'Time_h']
        dt = t_curr - t_prev

        # --- Feed volume in this interval ---
        # Integrate feed rate over [t_prev, t_curr] using small steps
        n_steps = max(int(dt * 10), 1)  # 0.1h resolution
        dt_step = dt / n_steps
        V_running = volumes[i-1]
        feed_this_interval = 0.0

        for step in range(n_steps):
            t_step = t_prev + step * dt_step
            rate = get_feed_rate_at_time(t_step, batch, metadata)

            if feed_unit == 'mL/L/h':
                # rate is in mL per liter of reactor per hour
                actual_rate_mLh = rate * (V_running / 1000.0)
            else:
                # rate is in mL/h (absolute)
                actual_rate_mLh = rate

            feed_step = actual_rate_mLh * dt_step
            feed_this_interval += feed_step
            V_running += feed_step  # volume grows as feed is added

        # --- Supplement volume in this interval ---
        supp_vol = get_supplements_between(t_prev, t_curr, batch, metadata)

        # --- Sampling loss ---
        sampling_loss = sample_vol  # one sample at this timepoint

        # --- Update cumulative and current volume ---
        cumul_feed[i] = cumul_feed[i-1] + feed_this_interval
        cumul_supp[i] = cumul_supp[i-1] + supp_vol
        volumes[i] = volumes[i-1] + feed_this_interval + supp_vol - sampling_loss

    df['Volume_mL'] = volumes
    df['Cumul_Feed_mL'] = cumul_feed
    df['Cumul_Supplement_mL'] = cumul_supp

    return df


# =============================================================================
# SECTION 3: BIOMASS CALCULATIONS (DCW)
# =============================================================================

def compute_dcw(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """Compute DCW concentration and total DCW mass.

    DCW concentration (g/L):
      WCW is reported in mg per 3 mL sample.
      Concentration = WCW_mg3mL / 3 (gives mg/mL = g/L)
      DCW = WCW_concentration * dcw_wcw_ratio

    Total DCW mass (g):
      mass = DCW_gL * Volume_L

    Reference for dcw_wcw_ratio = 0.25:
      Shuler, M. L., & Kargi, F. (2002). Bioprocess Engineering: Basic Concepts.
    """
    df = df.copy()
    ratio = params.get('dcw_wcw_ratio', 0.25)

    # WCW concentration in g/L (= mg/mL since WCW is mg per 3 mL)
    df['WCW_gL'] = df['WCW_mg3mL'] / 3.0

    # DCW concentration
    df['DCW_gL'] = df['WCW_gL'] * ratio

    # Total DCW mass (grams)
    df['DCW_mass_g'] = df['DCW_gL'] * (df['Volume_mL'] / 1000.0)

    # Volumetric productivity (g DCW / L / h)
    df['Vol_Productivity_gLh'] = np.where(
        df['Time_h'] > 0,
        df['DCW_gL'] / df['Time_h'],
        np.nan
    )

    return df


# =============================================================================
# SECTION 4: SPECIFIC GROWTH RATE
# =============================================================================

def savgol_smooth(y: np.ndarray, window: int = 5, order: int = 2) -> np.ndarray:
    """Savitzky-Golay-like smoothing using rolling polynomial fit.

    Falls back to scipy.signal.savgol_filter if available,
    otherwise uses a manual implementation.
    """
    try:
        from scipy.signal import savgol_filter
        if len(y) >= window:
            return savgol_filter(y, window_length=window, polyorder=order)
        return y.copy()
    except ImportError:
        pass

    # Manual fallback
    n = len(y)
    if n < window:
        return y.copy()
    smoothed = y.copy()
    half_w = window // 2
    for i in range(half_w, n - half_w):
        x_local = np.arange(-half_w, half_w + 1, dtype=float)
        y_local = y[i - half_w:i + half_w + 1]
        if len(y_local) == window:
            coeffs = np.polyfit(x_local, y_local, min(order, len(x_local) - 1))
            smoothed[i] = np.polyval(coeffs, 0)
    return smoothed


def compute_mu(df: pd.DataFrame, params: dict,
               use_mass: bool = True) -> pd.DataFrame:
    """Compute specific growth rate (mu) from DCW data.

    Args:
        df: DataFrame with Time_h, DCW_gL, DCW_mass_g columns
        params: dict with 'savgol_window' and 'savgol_order'
        use_mass: if True, compute mu from total mass (avoids dilution artifact);
                  if False, compute from concentration

    mu = d(ln(X)) / dt, computed via central differences.
    """
    df = df.copy()
    window = params.get('savgol_window', 5)
    order = params.get('savgol_order', 2)

    t = df['Time_h'].values.astype(float)

    if use_mass:
        X = df['DCW_mass_g'].values.astype(float)
    else:
        X = df['DCW_gL'].values.astype(float)

    # Avoid log(0)
    X_safe = np.where(X > 0, X, 1e-6)
    ln_X = np.log(X_safe)

    # Central differences for d(ln(X))/dt
    mu_raw = np.gradient(ln_X, t)

    # Smooth
    mu_smooth = savgol_smooth(mu_raw, window=window, order=order)

    df['mu_raw_h'] = mu_raw
    df['mu_smooth_h'] = mu_smooth
    df['ln_DCW'] = ln_X

    return df


# =============================================================================
# SECTION 5: GROWTH PHASE SEGMENTATION
# =============================================================================

def segment_growth_phases(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """Identify growth phases from DCW mass trajectory.

    Phases:
      - 'lag': mu < lag_threshold for initial timepoints
      - 'exponential': mu > exponential_threshold
      - 'linear': mu declining but positive, biomass still increasing linearly
      - 'stationary': mu near zero
      - 'decline': mu < 0 (biomass decreasing)

    Uses smoothed mu values. Thresholds from params.
    """
    df = df.copy()

    mu_exp_threshold = params.get('mu_exponential_threshold', 0.05)  # h^-1
    mu_decline_threshold = params.get('mu_decline_threshold', -0.005)
    mu_stationary_band = params.get('mu_stationary_band', 0.01)

    phases = []
    mu = df['mu_smooth_h'].values
    t = df['Time_h'].values

    # Find peak mu index
    peak_idx = np.argmax(mu)

    for i in range(len(df)):
        if mu[i] < mu_decline_threshold:
            phases.append('decline')
        elif abs(mu[i]) < mu_stationary_band:
            phases.append('stationary')
        elif mu[i] >= mu_exp_threshold and i <= peak_idx + 2:
            phases.append('exponential')
        elif mu[i] > mu_stationary_band:
            phases.append('linear')
        else:
            phases.append('transition')

    df['growth_phase'] = phases
    return df


# =============================================================================
# SECTION 6: CARBON BALANCE
# =============================================================================

def compute_glucose_fed(batch: str, metadata: pd.DataFrame,
                        t_end: float, params: dict,
                        batch_df: pd.DataFrame = None) -> dict:
    """Compute total glucose added to reactor up to time t_end.

    Sources:
      1. Batch medium: glucose_conc_batch_gL * V_initial_L
      2. Continuous feed: integrate feed_rate * glucose_conc_feed_gL over time
      3. Glucose pulses: explicit volumes at known concentrations

    For B01-B03 (feed in mL/L/h): actual mL/h = rate * V(t) in L.
      We need the volume trajectory for accurate integration.
    For B04-B06 (feed in mL/h): direct integration.

    Returns dict with batch_glucose_g, fed_glucose_g, pulse_glucose_g, total_glucose_g
    """
    glucose_conc_feed = params.get('glucose_conc_feed_gL', 620.0)
    glucose_conc_batch = params.get('glucose_conc_batch_gL', 20.0)
    glucose_conc_pulse = params.get('glucose_conc_pulse_gL', 500.0)  # 50% w/v

    feed_segs = metadata[(metadata['Table'] == 'feed_segment') &
                         (metadata['Batch'] == batch)].sort_values('Start_h')

    if len(feed_segs) == 0:
        return {'batch_glucose_g': 0, 'fed_glucose_g': 0,
                'pulse_glucose_g': 0, 'total_glucose_g': 0}

    feed_unit = feed_segs['Unit'].iloc[0]

    # Use per-batch batch medium volume for glucose calculation
    # (excludes inoculum — only the medium contains glucose)
    v_batch_medium_map = params.get('V_batch_medium_mL', {})
    if batch in v_batch_medium_map:
        V_batch_medium_mL = v_batch_medium_map[batch]
    else:
        V_batch_medium_mL = (batch_df['Scale_L'].iloc[0] if batch_df is not None else 1.5) * 1000

    V_batch_medium_L = V_batch_medium_mL / 1000.0

    # Per-batch initial volume (medium + inoculum) for volume-dependent calcs
    v_initial_map = params.get('V_initial_mL', {})
    if batch in v_initial_map:
        V_initial = v_initial_map[batch]
    else:
        V_initial = V_batch_medium_mL  # fallback

    # 1. Batch glucose (only medium contains glucose, not inoculum)
    batch_glucose = glucose_conc_batch * V_batch_medium_L  # g

    # 2. Continuous feed glucose
    # Integrate feed volume, then convert to glucose mass
    total_feed_mL = 0.0

    if batch_df is not None and 'Volume_mL' in batch_df.columns:
        # Use reconstructed volume for B01-B03
        for _, seg in feed_segs.iterrows():
            seg_start = max(seg['Start_h'], 0)
            seg_end = min(seg['End_h'], t_end)
            if seg_start >= seg_end:
                continue
            rate = seg['Rate_or_Volume']
            if rate == 0:
                continue

            if feed_unit == 'mL/L/h':
                # Need to integrate rate * V(t)/1000 over the interval
                # Use volume at midpoint as approximation
                t_mid = (seg_start + seg_end) / 2
                # Interpolate volume at midpoint
                V_mid = np.interp(t_mid, batch_df['Time_h'].values,
                                  batch_df['Volume_mL'].values)
                actual_rate = rate * (V_mid / 1000.0)  # mL/h
                feed_mL = actual_rate * (seg_end - seg_start)
            else:
                feed_mL = rate * (seg_end - seg_start)

            total_feed_mL += feed_mL
    else:
        # Fallback: simple integration without volume correction
        for _, seg in feed_segs.iterrows():
            seg_start = max(seg['Start_h'], 0)
            seg_end = min(seg['End_h'], t_end)
            if seg_start >= seg_end:
                continue
            rate = seg['Rate_or_Volume']
            if rate == 0:
                continue
            if feed_unit == 'mL/L/h':
                feed_mL = rate * scale_L * (seg_end - seg_start)
            else:
                feed_mL = rate * (seg_end - seg_start)
            total_feed_mL += feed_mL

    fed_glucose = total_feed_mL / 1000.0 * glucose_conc_feed  # g

    # 3. Glucose pulses
    pulses = metadata[(metadata['Table'] == 'supplement') &
                      (metadata['Batch'] == batch) &
                      (metadata['Type'] == 'glucose_pulse') &
                      (metadata['Start_h'] <= t_end)]

    pulse_glucose = 0.0
    for _, p in pulses.iterrows():
        vol_mL = p['Rate_or_Volume']
        pulse_glucose += vol_mL / 1000.0 * glucose_conc_pulse

    return {
        'batch_glucose_g': round(batch_glucose, 2),
        'fed_glucose_g': round(fed_glucose, 2),
        'pulse_glucose_g': round(pulse_glucose, 2),
        'total_glucose_g': round(batch_glucose + fed_glucose + pulse_glucose, 2)
    }


def compute_carbon_balance(df: pd.DataFrame, metadata: pd.DataFrame,
                           params: dict) -> dict:
    """Full carbon balance for a single batch.

    Returns dict with glucose_in, biomass_out, theoretical_max, yield_fraction.
    """
    batch = df['Batch'].iloc[0]
    t_end = df['Time_h'].max()
    Yxs = params.get('Yxs', 0.45)

    glucose = compute_glucose_fed(batch, metadata, t_end, params, batch_df=df)

    dcw_initial = df['DCW_mass_g'].iloc[0]
    dcw_final = df['DCW_mass_g'].iloc[-1]
    delta_dcw = dcw_final - dcw_initial

    theoretical_max = glucose['total_glucose_g'] * Yxs
    yield_frac = delta_dcw / theoretical_max if theoretical_max > 0 else 0

    return {
        'batch': batch,
        **glucose,
        'dcw_initial_g': round(dcw_initial, 2),
        'dcw_final_g': round(dcw_final, 2),
        'delta_dcw_g': round(delta_dcw, 2),
        'theoretical_max_dcw_g': round(theoretical_max, 2),
        'yield_fraction': round(yield_frac, 3),
    }


# =============================================================================
# SECTION 7: GLUCOSE CONCENTRATION ESTIMATION (CRABTREE CHECK)
# =============================================================================

def estimate_glucose_concentration(df: pd.DataFrame, metadata: pd.DataFrame,
                                   params: dict) -> pd.DataFrame:
    """Estimate glucose concentration in the fermenter at each timepoint.

    Mass balance at each timepoint:
      glucose_in_reactor(t) = glucose_remaining_from_batch(t)
                            + cumulative_glucose_fed(t)
                            - cumulative_glucose_consumed(t)

    Glucose consumed by cells:
      delta_glucose = delta_DCW_mass / Yxs

    Concentration:
      [glucose](t) = glucose_in_reactor(t) / V(t)

    Crabtree threshold: flag if [glucose] > 0.1 g/L
    """
    df = df.copy()
    batch = df['Batch'].iloc[0]
    Yxs = params.get('Yxs', 0.45)
    glucose_conc_feed = params.get('glucose_conc_feed_gL', 620.0)
    glucose_conc_batch = params.get('glucose_conc_batch_gL', 20.0)
    glucose_conc_pulse = params.get('glucose_conc_pulse_gL', 500.0)
    crabtree_threshold = params.get('crabtree_threshold_gL', 0.1)

    # Use per-batch batch medium volume (excludes inoculum)
    v_batch_medium_map = params.get('V_batch_medium_mL', {})
    if batch in v_batch_medium_map:
        V_batch_medium_L = v_batch_medium_map[batch] / 1000.0
    else:
        V_batch_medium_L = df['Scale_L'].iloc[0]  # fallback

    # Initial glucose mass in reactor (only from batch medium, not inoculum)
    batch_glucose_g = glucose_conc_batch * V_batch_medium_L

    glucose_in_reactor = np.zeros(len(df))
    cumul_glucose_fed = np.zeros(len(df))
    cumul_glucose_consumed = np.zeros(len(df))

    glucose_in_reactor[0] = batch_glucose_g

    for i in range(1, len(df)):
        t_prev = df.iloc[i-1]['Time_h']
        t_curr = df.iloc[i]['Time_h']

        # Glucose fed in this interval (from continuous feed)
        feed_segs = metadata[(metadata['Table'] == 'feed_segment') &
                             (metadata['Batch'] == batch)].sort_values('Start_h')
        feed_unit = df['Feed_Unit'].iloc[0]

        feed_mL_interval = 0.0
        for _, seg in feed_segs.iterrows():
            seg_s = max(seg['Start_h'], t_prev)
            seg_e = min(seg['End_h'], t_curr)
            if seg_s >= seg_e:
                continue
            rate = seg['Rate_or_Volume']
            if rate == 0:
                continue
            if feed_unit == 'mL/L/h':
                V_mid = np.interp((seg_s + seg_e)/2,
                                  df['Time_h'].values, df['Volume_mL'].values)
                actual_rate = rate * (V_mid / 1000.0)
            else:
                actual_rate = rate
            feed_mL_interval += actual_rate * (seg_e - seg_s)

        glucose_fed_interval = feed_mL_interval / 1000.0 * glucose_conc_feed

        # Glucose from pulses in this interval
        pulses = metadata[(metadata['Table'] == 'supplement') &
                          (metadata['Batch'] == batch) &
                          (metadata['Type'] == 'glucose_pulse') &
                          (metadata['Start_h'] > t_prev) &
                          (metadata['Start_h'] <= t_curr)]
        pulse_glucose = sum(
            p['Rate_or_Volume'] / 1000.0 * glucose_conc_pulse
            for _, p in pulses.iterrows()
        )

        # Glucose consumed = biomass produced / Yxs
        delta_dcw = df.iloc[i]['DCW_mass_g'] - df.iloc[i-1]['DCW_mass_g']
        glucose_consumed = max(delta_dcw, 0) / Yxs  # only count positive growth

        cumul_glucose_fed[i] = cumul_glucose_fed[i-1] + glucose_fed_interval + pulse_glucose
        cumul_glucose_consumed[i] = cumul_glucose_consumed[i-1] + glucose_consumed

        glucose_in_reactor[i] = (batch_glucose_g + cumul_glucose_fed[i]
                                 - cumul_glucose_consumed[i])
        # Floor at zero (can't have negative glucose)
        glucose_in_reactor[i] = max(glucose_in_reactor[i], 0)

    df['Cumul_Glucose_Fed_g'] = cumul_glucose_fed
    df['Cumul_Glucose_Consumed_g'] = cumul_glucose_consumed
    df['Glucose_InReactor_g'] = glucose_in_reactor
    df['Glucose_Conc_gL'] = glucose_in_reactor / (df['Volume_mL'] / 1000.0)
    df['Crabtree_Flag'] = df['Glucose_Conc_gL'] > crabtree_threshold

    # --- Specific glucose feed rate (qs) ---
    # qs = (feed_rate_mL_h * glucose_conc_gL / 1000) / (DCW_gL * V_L)
    #    = g glucose / g DCW / h
    # Critical qs for S. cerevisiae Crabtree: ~0.20-0.30 g/g/h
    # Above this, overflow metabolism → ethanol production
    # Ref: Postma, E., et al. (1989). Appl Environ Microbiol.
    #       Van Hoek, P., et al. (1998). Biotechnol Bioeng.
    qs_crit = params.get('qs_critical_ggh', 0.25)
    qs = np.zeros(len(df))
    for i in range(len(df)):
        t = df.iloc[i]['Time_h']
        rate = get_feed_rate_at_time(t, batch, metadata)
        feed_unit = df['Feed_Unit'].iloc[0]

        if feed_unit == 'mL/L/h':
            V_L = df.iloc[i]['Volume_mL'] / 1000.0
            actual_rate_mLh = rate * V_L
        else:
            actual_rate_mLh = rate

        glucose_rate_g_h = actual_rate_mLh / 1000.0 * glucose_conc_feed
        dcw_mass_g = df.iloc[i]['DCW_mass_g']
        if dcw_mass_g > 0.1:
            qs[i] = glucose_rate_g_h / dcw_mass_g
        else:
            qs[i] = np.nan

    df['qs_ggh'] = qs
    df['Crabtree_qs_Flag'] = df['qs_ggh'] > qs_crit

    return df


# =============================================================================
# SECTION 8: OD/WCW RATIO
# =============================================================================

def compute_od_wcw_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Compute OD600 / WCW ratio over time.

    This ratio reflects cell size/composition changes:
    - Declining ratio: cells getting heavier (lipid accumulation, vacuolation)
    - Increasing ratio: cell fragmentation, lysis
    """
    df = df.copy()
    df['OD_WCW_ratio'] = df['OD600'] / df['WCW_mg3mL'].replace(0, np.nan)
    return df


# =============================================================================
# SECTION 9: kLa AND OXYGEN TRANSFER
# =============================================================================

def estimate_our(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """Estimate Oxygen Uptake Rate (OUR) using the Pirt equation.

    Pirt equation for OUR:
        OUR (mmol O2 / L / h) = (mu / Y_XO2_max + mO2) * X

    where:
      mu       = specific growth rate (h^-1)
      X        = biomass concentration (g DCW / L)
      Y_XO2_max = maximum (true) biomass yield on oxygen (g DCW / mmol O2)
                  Converted from g/g via: Y_XO2_max_g_mmol = Y_XO2_max_g_g / 31.25
                  (since 1 g O2 = 1000/32 = 31.25 mmol)
      mO2      = maintenance oxygen coefficient (mmol O2 / g DCW / h)
                  Typical for S. cerevisiae at 30C: ~1.0 mmol/g/h

    The first term (mu / Y_XO2_max) is the growth-associated oxygen demand.
    The second term (mO2) is the maintenance oxygen demand — oxygen consumed
    just to keep cells alive (membrane potential, protein turnover, etc.).

    At low growth rates, the maintenance term dominates; at high growth rates,
    the growth term dominates. This correctly captures the observation that
    OUR does not drop to zero when mu approaches zero (cells still breathe).

    References:
      - Pirt, S. J. (1965). The maintenance energy of bacteria in growing cultures.
        Proc. R. Soc. Lond. B 163, 224-231.
      - Verduyn, C., et al. (1991). Energetics of S. cerevisiae in anaerobic
        and aerobic glucose-limited chemostat cultures.
      - Van den Berg, J. J., et al. (2013). Kinetics and stoichiometry of
        Saccharomyces cerevisiae growth.
      - Sonnleitner, B., & Kappeli, O. (1986). Growth of S. cerevisiae is
        controlled by its limited respiratory capacity. Biotechnol. Bioeng. 28.
    """
    df = df.copy()

    # Retrieve parameters
    Y_XO2_gg = params.get('Y_XO2', 1.25)       # g DCW / g O2
    mO2 = params.get('mO2_mmol_gDCW_h', 1.0)   # mmol O2 / g DCW / h

    # Convert Y_XO2 from g/g to g/mmol  (1 g O2 = 31.25 mmol)
    Y_XO2_max_g_mmol = Y_XO2_gg / 31.25  # g DCW / mmol O2

    mu = df['mu_smooth_h'].values
    X = df['DCW_gL'].values

    # Pirt equation: OUR = (mu / Y_XO2_max + mO2) * X   [mmol O2 / L / h]
    # Growth-associated term: only when mu > 0
    growth_term = np.where(mu > 0, mu / Y_XO2_max_g_mmol, 0.0)
    # Maintenance term: always present when cells exist
    maintenance_term = mO2

    our_mmol = (growth_term + maintenance_term) * X

    # Convenience column in g O2 / L / h (MW O2 = 32)
    our_g = our_mmol * 32.0 / 1000.0

    # Decompose for diagnostic plots
    df['OUR_growth_mmol_L_h'] = growth_term * X
    df['OUR_maint_mmol_L_h'] = maintenance_term * X
    df['OUR_gO2_L_h'] = our_g
    df['OUR_mmol_L_h'] = our_mmol

    return df


def estimate_kla(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """Estimate kLa from oxygen balance — all units in mmol O2.

    At pseudo-steady state: OTR = OUR
    OTR = kLa * (C* - C_L)

    Therefore: kLa = OUR / (C* - C_L)

    where:
      C* = saturated DO at 30C, 1 atm air (mmol O2 / L)
           Converted from mg/L: C*_mmol = C*_mg / 32.0
           7.8 mg/L → 0.244 mmol/L
      C_L = actual DO = pO2/100 * C*  (mmol O2 / L)
      OUR = oxygen uptake rate (mmol O2 / L / h) — from Pirt equation

    Args:
        df: DataFrame with OUR_mmol_L_h, pO2_pct columns
        params: dict with 'C_star_mgL' (DO saturation in mg/L; converted internally)
    """
    df = df.copy()
    C_star_mg = params.get('C_star_mgL', 7.8)     # mg O2 / L
    C_star_mmol = C_star_mg / 32.0                  # mmol O2 / L (MW O2 = 32)

    pO2 = df['pO2_pct'].values

    # C_L = actual dissolved oxygen (mmol/L)
    C_L_mmol = pO2 / 100.0 * C_star_mmol

    # Driving force (mmol/L)
    driving_force_mmol = C_star_mmol - C_L_mmol

    # OUR in mmol O2 / L / h (directly from Pirt equation)
    our_mmol = df['OUR_mmol_L_h'].values

    # kLa (h^-1) = OUR / (C* - C_L)
    # Threshold: 0.1 mg/L driving force = 0.003125 mmol/L
    DF_THRESHOLD_MMOL = 0.1 / 32.0  # ~0.003125 mmol/L
    with np.errstate(divide='ignore', invalid='ignore'):
        kla = np.where(driving_force_mmol > DF_THRESHOLD_MMOL,
                       our_mmol / driving_force_mmol, np.nan)

    # Store in both mmol and mg for user convenience
    df['C_star_mmol_L'] = C_star_mmol
    df['C_L_mmol_L'] = C_L_mmol
    df['C_L_mgL'] = pO2 / 100.0 * C_star_mg           # legacy column
    df['Driving_Force_mmol_L'] = driving_force_mmol
    df['Driving_Force_mgL'] = C_star_mg - df['C_L_mgL']  # legacy column
    df['kLa_h'] = kla

    return df


def kla_sensitivity(df: pd.DataFrame, params: dict,
                    Y_XO2_values: List[float] = None,
                    mO2_values: List[float] = None) -> pd.DataFrame:
    """Run kLa estimation at multiple Y_XO2 and/or mO2 values for sensitivity.

    By default, varies Y_XO2 at [1.0, 1.25, 1.5] g/g with mO2 fixed.
    If mO2_values is also provided, creates the full grid (Y_XO2 × mO2).

    Returns a long-format DataFrame with columns:
      Time_h, Y_XO2, mO2, OUR_gO2_L_h, OUR_mmol_L_h, kLa_h, DCW_gL, mu_smooth_h
    """
    if Y_XO2_values is None:
        Y_XO2_values = [1.0, 1.25, 1.5]
    if mO2_values is None:
        mO2_values = [params.get('mO2_mmol_gDCW_h', 1.0)]

    results = []
    for yxo2 in Y_XO2_values:
        for mo2 in mO2_values:
            p = params.copy()
            p['Y_XO2'] = yxo2
            p['mO2_mmol_gDCW_h'] = mo2
            df_calc = estimate_our(df.copy(), p)
            df_calc = estimate_kla(df_calc, p)
            for _, row in df_calc.iterrows():
                results.append({
                    'Time_h': row['Time_h'],
                    'Y_XO2': yxo2,
                    'mO2': mo2,
                    'OUR_gO2_L_h': row['OUR_gO2_L_h'],
                    'OUR_mmol_L_h': row.get('OUR_mmol_L_h', np.nan),
                    'OUR_growth_mmol_L_h': row.get('OUR_growth_mmol_L_h', np.nan),
                    'OUR_maint_mmol_L_h': row.get('OUR_maint_mmol_L_h', np.nan),
                    'kLa_h': row['kLa_h'],
                    'DCW_gL': row['DCW_gL'],
                    'mu_smooth_h': row['mu_smooth_h'],
                })

    return pd.DataFrame(results)


# =============================================================================
# SECTION 10: UTILITY / PLOTTING HELPERS
# =============================================================================

# Consistent color palette for all plots
BATCH_COLORS = {
    'B01': '#1f77b4',  # blue
    'B02': '#ff7f0e',  # orange
    'B03': '#2ca02c',  # green
    'B04': '#d62728',  # red
    'B05': '#9467bd',  # purple
    'B06': '#8c564b',  # brown
}

PHASE_COLORS = {
    'lag': '#d3d3d3',
    'exponential': '#2ca02c',
    'linear': '#1f77b4',
    'stationary': '#ff7f0e',
    'decline': '#d62728',
    'transition': '#bcbd22',
}


def process_all_batches(data: pd.DataFrame, metadata: pd.DataFrame,
                        params: dict) -> Dict[str, pd.DataFrame]:
    """Run the full processing pipeline on all batches.

    Returns a dict of {batch_name: processed_DataFrame}
    """
    results = {}
    for batch_name in sorted(data['Batch'].unique()):
        batch_df = data[data['Batch'] == batch_name].copy()

        # 1. Volume reconstruction
        df = reconstruct_volume(batch_df, metadata, params)

        # 2. DCW calculation
        df = compute_dcw(df, params)

        # 3. Growth rate
        df = compute_mu(df, params, use_mass=True)

        # 4. Phase segmentation
        df = segment_growth_phases(df, params)

        # 5. OD/WCW ratio
        df = compute_od_wcw_ratio(df)

        # 6. Glucose concentration
        df = estimate_glucose_concentration(df, metadata, params)

        # 7. OUR estimation
        df = estimate_our(df, params)

        # 8. kLa estimation (only if pO2 data exists)
        if df['pO2_pct'].notna().any():
            df = estimate_kla(df, params)
        else:
            df['C_L_mgL'] = np.nan
            df['Driving_Force_mgL'] = np.nan
            df['kLa_h'] = np.nan

        results[batch_name] = df

    return results
