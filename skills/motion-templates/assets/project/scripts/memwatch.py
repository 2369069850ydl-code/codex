#!/usr/bin/env python3
"""Run a command and sample its process tree + system memory every INTERVAL seconds.

usage: python3 -I scripts/memwatch.py <log_prefix> -- <command...>

Writes <log_prefix>.csv (samples) and <log_prefix>.summary.txt, and tees the command's
output to <log_prefix>.out.log. Values are *samples*, not exact peaks: anything that
rises and falls between two samples is missed.

Safety stop: if MemAvailable stays below STOP_KB for STOP_SAMPLES consecutive samples,
the whole process group is killed and the reason is logged.
"""
import os, signal, subprocess, sys, time

INTERVAL = 0.5
STOP_KB = 80 * 1024
STOP_SAMPLES = 4


def meminfo():
    d = {}
    with open('/proc/meminfo') as f:
        for line in f:
            k, v = line.split(':', 1)
            d[k] = int(v.split()[0])
    return d


def children_map():
    m = {}
    for p in os.listdir('/proc'):
        if not p.isdigit():
            continue
        try:
            with open(f'/proc/{p}/stat') as f:
                s = f.read()
            ppid = int(s[s.rfind(')') + 2:].split()[1])
            m.setdefault(ppid, []).append(int(p))
        except (OSError, ValueError, IndexError):
            pass
    return m


def tree(root, m):
    out, stack = [], [root]
    while stack:
        p = stack.pop()
        out.append(p)
        stack.extend(m.get(p, []))
    return out


def proc_mem(pid):
    rss = pss = 0
    name = '?'
    try:
        with open(f'/proc/{pid}/status') as f:
            for line in f:
                if line.startswith('VmRSS:'):
                    rss = int(line.split()[1])
                elif line.startswith('Name:'):
                    name = line.split()[1]
        with open(f'/proc/{pid}/smaps_rollup') as f:
            for line in f:
                if line.startswith('Pss:'):
                    pss = int(line.split()[1])
                    break
    except OSError:
        pass
    return rss, pss, name


def main():
    prefix = sys.argv[1]
    cmd = sys.argv[sys.argv.index('--') + 1:]
    m0 = meminfo()
    swap0 = m0['SwapTotal'] - m0['SwapFree']
    t0 = time.time()
    out = open(prefix + '.out.log', 'wb')
    proc = subprocess.Popen(cmd, stdout=out, stderr=subprocess.STDOUT, start_new_session=True)
    csv = open(prefix + '.csv', 'w')
    csv.write('t_s,tree_rss_kb,tree_pss_kb,nprocs,mem_available_kb,swap_used_kb,top_proc\n')
    peak_rss = peak_pss = 0
    min_avail = m0['MemAvailable']
    max_swap = swap0
    low_count = 0
    stopped = None
    n = 0
    while proc.poll() is None:
        m = meminfo()
        pids = tree(proc.pid, children_map())
        rss_sum = pss_sum = 0
        top = ('', 0)
        for p in pids:
            r, ps, name = proc_mem(p)
            rss_sum += r
            pss_sum += ps
            if r > top[1]:
                top = (name, r)
        avail = m['MemAvailable']
        swap = m['SwapTotal'] - m['SwapFree']
        t = time.time() - t0
        csv.write(f'{t:.1f},{rss_sum},{pss_sum},{len(pids)},{avail},{swap},{top[0]}:{top[1]}\n')
        csv.flush()
        n += 1
        peak_rss, peak_pss = max(peak_rss, rss_sum), max(peak_pss, pss_sum)
        min_avail, max_swap = min(min_avail, avail), max(max_swap, swap)
        low_count = low_count + 1 if avail < STOP_KB else 0
        if low_count >= STOP_SAMPLES:
            stopped = f'MemAvailable < {STOP_KB // 1024} MiB for {STOP_SAMPLES} samples at t={t:.1f}s'
            os.killpg(proc.pid, signal.SIGKILL)
            break
        time.sleep(INTERVAL)
    rc = proc.wait()
    wall = time.time() - t0
    m1 = meminfo()
    swap1 = m1['SwapTotal'] - m1['SwapFree']
    summary = (
        f'command: {" ".join(cmd)}\n'
        f'exit_code: {rc}\n'
        f'wall_s: {wall:.1f}\n'
        f'samples: {n} (every {INTERVAL}s; values are sampled, not exact peaks)\n'
        f'sampled_peak_tree_rss_MiB: {peak_rss / 1024:.0f}  (sum of RSS, double-counts shared pages)\n'
        f'sampled_peak_tree_pss_MiB: {peak_pss / 1024:.0f}  (proportional set size, closer to real use)\n'
        f'mem_available_before_MiB: {m0["MemAvailable"] / 1024:.0f}\n'
        f'sampled_min_mem_available_MiB: {min_avail / 1024:.0f}\n'
        f'swap_used_before_MiB: {swap0 / 1024:.0f}\n'
        f'sampled_max_swap_used_MiB: {max_swap / 1024:.0f}\n'
        f'swap_used_after_MiB: {swap1 / 1024:.0f}\n'
        f'safety_stop: {stopped or "no"}\n'
    )
    open(prefix + '.summary.txt', 'w').write(summary)
    print(summary)
    sys.exit(rc if rc is not None else 1)


if __name__ == '__main__':
    main()
