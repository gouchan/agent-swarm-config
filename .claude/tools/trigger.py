#!/usr/bin/env python3
import sys, subprocess
agent = sys.argv[1]
subprocess.Popen(["claude", f"agent:{agent}", "--swarm-loop"])
