"""Command line interface for SMF Lead Capture."""

import argparse
import json
import sys
from pathlib import Path

from . import LeadCapture
from .config import Config
from .database import Database


def main():
    parser = argparse.ArgumentParser(
        description="SMF Lead Capture - Lead capture and qualification system"
    )
    parser.add_argument("--config", default="config.yaml", help="Configuration file path")
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # init-db
    subparsers.add_parser("init-db", help="Initialize database")
    
    # server
    server_parser = subparsers.add_parser("server", help="Run web server")
    server_parser.add_argument("--host", help="Server host")
    server_parser.add_argument("--port", type=int, help="Server port")
    
    # process-lead
    process_parser = subparsers.add_parser("process-lead", help="Process a lead")
    process_parser.add_argument("--data", required=True, help="Lead data as JSON")
    
    # export
    export_parser = subparsers.add_parser("export", help="Export leads")
    export_parser.add_argument("--format", choices=["json", "csv"], default="json")
    export_parser.add_argument("--output", help="Output file path")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Execute command
    if args.command == "init-db":
        config = Config(args.config)
        Database(config.get("database.url", "sqlite:///data/leads.db"))
        print("✓ Database initialized")
    
    elif args.command == "server":
        from .server import run_server
        run_server(args.config, args.host, args.port)
    
    elif args.command == "process-lead":
        capture = LeadCapture(args.config)
        data = json.loads(args.data)
        result = capture.process_lead(data)
        print(json.dumps(result, indent=2))
    
    elif args.command == "export":
        capture = LeadCapture(args.config)
        output = capture.export_leads(args.format)
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"✓ Exported to {args.output}")
        else:
            print(output)


if __name__ == "__main__":
    main()