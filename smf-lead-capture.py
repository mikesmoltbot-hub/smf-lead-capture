#!/usr/bin/env python3
"""
SMF Lead Capture - Command Line Interface

Usage:
    smf-lead-capture init-db
    smf-lead-capture server [--config PATH] [--host HOST] [--port PORT]
    smf-lead-capture process-lead [--config PATH] --data JSON
    smf-lead-capture export [--config PATH] --format FORMAT --output FILE
    smf-lead-capture test [--config PATH]
"""

import argparse
import json
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from smf_lead_capture import LeadCapture
from smf_lead_capture.config import Config
from smf_lead_capture.database import Database


def cmd_init_db(args):
    """Initialize database."""
    config = Config(args.config)
    db = Database(config.get("database.url", "sqlite:///data/leads.db"))
    print("✓ Database initialized successfully")


def cmd_server(args):
    """Run Flask server."""
    from smf_lead_capture.server import run_server
    run_server(args.config, args.host, args.port)


def cmd_process_lead(args):
    """Process a lead from command line."""
    capture = LeadCapture(args.config)
    
    try:
        data = json.loads(args.data)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON data - {e}")
        sys.exit(1)
    
    result = capture.process_lead(data)
    print(json.dumps(result, indent=2))


def cmd_export(args):
    """Export leads."""
    capture = LeadCapture(args.config)
    
    output = capture.export_leads(args.format)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"✓ Exported to {args.output}")
    else:
        print(output)


def cmd_test(args):
    """Run tests."""
    import subprocess
    result = subprocess.run([sys.executable, "-m", "pytest", "-v"], 
                          capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser(
        description="SMF Lead Capture - Lead capture and qualification system"
    )
    parser.add_argument("--config", default="config.yaml", help="Configuration file path")
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # init-db
    init_db_parser = subparsers.add_parser("init-db", help="Initialize database")
    init_db_parser.set_defaults(func=cmd_init_db)
    
    # server
    server_parser = subparsers.add_parser("server", help="Run web server")
    server_parser.add_argument("--host", help="Server host")
    server_parser.add_argument("--port", type=int, help="Server port")
    server_parser.set_defaults(func=cmd_server)
    
    # process-lead
    process_parser = subparsers.add_parser("process-lead", help="Process a lead")
    process_parser.add_argument("--data", required=True, help="Lead data as JSON")
    process_parser.set_defaults(func=cmd_process_lead)
    
    # export
    export_parser = subparsers.add_parser("export", help="Export leads")
    export_parser.add_argument("--format", choices=["json", "csv"], default="json", help="Export format")
    export_parser.add_argument("--output", help="Output file path")
    export_parser.set_defaults(func=cmd_export)
    
    # test
    test_parser = subparsers.add_parser("test", help="Run tests")
    test_parser.set_defaults(func=cmd_test)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    args.func(args)


if __name__ == "__main__":
    main()