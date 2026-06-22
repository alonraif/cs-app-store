import { PrismaClient, ToolType } from '@prisma/client'

const prisma = new PrismaClient()

const tools = [
  {
    name: 'net-probe',
    shortDescription: 'Diagnose bonded uplink quality, packet loss, and latency across all active streams.',
    longDescription: `## net-probe

A CLI utility for diagnosing LiveU bonded uplink connections. Runs ICMP and UDP probes across all active cellular and Ethernet interfaces, correlates results with the LU Smart encoding bitrate, and outputs a structured report.

### Features
- Per-interface packet-loss and RTT measurement
- Correlates network jitter with encoder dropped frames
- Exports JSON or CSV for further analysis
- Works on LiveU Solo, LU600, LU800 units

### Usage

\`\`\`bash
# Install
npm install -g @liveu/net-probe

# Run against a unit
net-probe --unit 192.168.1.100 --duration 30s
\`\`\`

### Output
The tool prints a summary table and writes \`report.json\` to the current directory.
`,
    category: 'Diagnostics',
    type: ToolType.cli,
    version: '2.3.1',
    owner: 'Yoav Ben-David',
    ownerContact: '@yoavbd',
    screenshots: [],
    installCommand: 'npm install -g @liveu/net-probe',
    repoUrl: 'https://github.com/liveu-internal/net-probe',
  },
  {
    name: 'stream-dashboard',
    shortDescription: 'Real-time overview of all active streams across the LiveU Cloud with health indicators.',
    longDescription: `## Stream Dashboard

A web application providing a live overview of all encoder units currently streaming through LiveU Cloud. Aggregates data from the LU-Central API and displays connection health, bitrate trends, and alert flags on a single screen.

### Features
- Auto-refreshing stream grid (configurable interval)
- Color-coded health indicators (green / amber / red)
- Bitrate sparklines per unit
- Click-through to full unit diagnostics
- Alert history timeline

### Access
This tool is deployed on the CS internal cluster. No installation required — just open the URL.
`,
    category: 'Monitoring',
    type: ToolType.webapp,
    version: '1.7.0',
    owner: 'Noa Shapiro',
    ownerContact: '@noash',
    screenshots: [],
    launchUrl: 'http://stream-dashboard.cs.liveu.internal',
  },
  {
    name: 'log-collector',
    shortDescription: 'Desktop app to pull, merge, and filter encoder logs from multiple LiveU units at once.',
    longDescription: `## Log Collector

A cross-platform desktop application (Windows / macOS) that connects to multiple LiveU encoder units over the local network, pulls their system and application logs, and merges them into a unified timeline.

### Features
- Scan a subnet for LiveU units automatically
- Pull logs from multiple units in parallel
- Merge into a single time-sorted log stream
- Filter by severity, component, or unit serial
- Export merged log as \`.txt\` or \`.zip\`

### System Requirements
- Windows 10+ or macOS 12+
- Network access to the encoder units (same subnet or VPN)
`,
    category: 'Diagnostics',
    type: ToolType.desktop,
    version: '3.1.0',
    owner: 'Itai Levi',
    ownerContact: 'itai.levi@liveu.tv',
    screenshots: [],
    downloadUrl: '',
  },
  {
    name: 'cert-checker',
    shortDescription: 'Validate SSL/TLS certificates for all LiveU cloud endpoints and print expiry warnings.',
    longDescription: `## cert-checker

CLI tool that iterates over a configurable list of LiveU cloud hostnames, fetches their TLS certificates, and reports expiry dates, chain validity, and cipher suite info.

### Usage

\`\`\`bash
npm install -g @liveu/cert-checker
cert-checker --config endpoints.json --warn-days 30
\`\`\`

### Configuration
Create an \`endpoints.json\` listing the hostnames to check. The tool exits with code 1 if any certificate is expiring within the threshold, making it easy to integrate into CI.
`,
    category: 'Automation',
    type: ToolType.cli,
    version: '1.2.0',
    owner: 'Michal Katz',
    ownerContact: '@michalk',
    screenshots: [],
    installCommand: 'npm install -g @liveu/cert-checker',
    repoUrl: 'https://github.com/liveu-internal/cert-checker',
  },
  {
    name: 'deploy-bot',
    shortDescription: 'Automate rolling deployments of CS internal services to the on-prem Kubernetes cluster.',
    longDescription: `## deploy-bot

A CLI wrapper around \`kubectl\` and Helm that enforces LiveU CS deployment conventions: health-check gating, automatic rollback on failure, Slack notifications, and a mandatory change-log entry.

### Features
- Helm chart deployment with pre/post health checks
- Automatic rollback if liveness probe fails within 2 min
- Slack notification on deploy start, success, and rollback
- Writes to the internal changelog Confluence page
- Dry-run mode for plan preview

### Usage

\`\`\`bash
npm install -g @liveu/deploy-bot
deploy-bot deploy --app stream-ingestor --version 2.4.1 --env staging
\`\`\`
`,
    category: 'Automation',
    type: ToolType.cli,
    version: '4.0.3',
    owner: 'Oren Mizrahi',
    ownerContact: '@orenm',
    screenshots: [],
    installCommand: 'npm install -g @liveu/deploy-bot',
    repoUrl: 'https://github.com/liveu-internal/deploy-bot',
  },
  {
    name: 'metrics-viewer',
    shortDescription: 'Visualize encoder performance metrics from InfluxDB with pre-built LiveU dashboards.',
    longDescription: `## Metrics Viewer

A web-based metrics explorer pre-configured with LiveU-specific InfluxDB queries. Provides dashboards for video quality (VMAF, PSNR), bonding throughput, cloud transcoding latency, and CDN egress costs.

### Available Dashboards
- **Encoder Health** — CPU, memory, thermal, uptime per unit
- **Bond Quality** — per-interface throughput, loss, RTT
- **Cloud Pipeline** — ingest latency, transcode queue depth, egress bytes
- **Cost Explorer** — CDN egress costs by region and customer tier

### Access
Available on the internal network. Uses read-only InfluxDB credentials; no configuration required.
`,
    category: 'Monitoring',
    type: ToolType.webapp,
    version: '2.1.0',
    owner: 'Shira Cohen',
    ownerContact: 'shira.cohen@liveu.tv',
    screenshots: [],
    launchUrl: 'http://metrics.cs.liveu.internal',
  },
  {
    name: 'config-manager',
    shortDescription: 'View, diff, and push encoder configuration profiles to units in the field.',
    longDescription: `## Config Manager

A web tool that maintains a library of LiveU encoder configuration profiles and provides a diff-and-push interface for deploying them to units in the field.

### Features
- Profile library with version history (git-backed)
- Side-by-side diff of two profiles
- Push profile to one or more units by serial number
- Per-push audit log with who, when, and what changed
- Rollback to any prior version

### How it works
Config Manager talks to the LU-Central management API. Units must be online and reachable through the cloud. Authentication uses the shared CS service account.
`,
    category: 'Automation',
    type: ToolType.webapp,
    version: '1.5.2',
    owner: 'Tal Friedman',
    ownerContact: '@talf',
    screenshots: [],
    launchUrl: 'http://config-mgr.cs.liveu.internal',
  },
  {
    name: 'bond-simulator',
    shortDescription: 'Simulate multi-path bonding behaviour under configurable packet loss and bandwidth caps.',
    longDescription: `## Bond Simulator

A desktop application that emulates the LiveU bonding algorithm under controlled network conditions. CS engineers use it to reproduce customer-reported bonding issues without needing physical units.

### Features
- Define up to 8 virtual interfaces with independent loss / delay / bandwidth parameters
- Record and replay real pcap files as network input
- Live chart of allocation per interface, total bitrate, and buffer fill
- Export simulation trace for inclusion in bug reports

### Use Cases
- Reproduce "video freezing when one SIM drops" scenarios
- Validate new bonding algorithm changes before field testing
- Generate reproducible test cases for QA
`,
    category: 'Diagnostics',
    type: ToolType.desktop,
    version: '0.9.4',
    owner: 'Avi Stern',
    ownerContact: '@avistern',
    screenshots: [],
    downloadUrl: '',
  },
  {
    name: 'api-tester',
    shortDescription: 'Pre-loaded Postman-style runner for all LiveU Cloud and LU-Central REST APIs.',
    longDescription: `## API Tester

An internal web app pre-loaded with all LiveU Cloud, LU-Central, and partner API collections. Saves CS engineers from manually setting up environments, auth headers, and common request templates.

### Collections included
- LU-Central REST API (all versions)
- LiveU Cloud CDN control API
- VideoCloud ingest webhook simulator
- Partner integration APIs (MediaLive, Wirecast, vMix)

### Features
- Environment switching (prod / staging / dev)
- Auth header injection from the secrets vault
- Response diff between API versions
- Share request permalinks with teammates
`,
    category: 'Diagnostics',
    type: ToolType.webapp,
    version: '3.2.0',
    owner: 'Noa Shapiro',
    ownerContact: '@noash',
    screenshots: [],
    launchUrl: 'http://api-tester.cs.liveu.internal',
  },
  {
    name: 'unit-flasher',
    shortDescription: 'Flash firmware images to LiveU units over USB or SSH with verification and rollback.',
    longDescription: `## Unit Flasher

A desktop GUI for flashing official and experimental firmware images to LiveU hardware units. Handles partition writing, checksum verification, and automatic rollback if the unit fails to boot after flashing.

### Supported Hardware
- LU600, LU800, LU2000, LiveU Solo+
- Connect via USB-C (direct) or SSH (over network)

### Safety Features
- SHA-256 verification before and after write
- Boot-loop detection with automatic rollback to prior firmware
- Flash log saved locally for each operation
- Prevents flashing release units with experimental builds (override available with \`--force\`)

### Requirements
Windows 10+ or macOS 12+. Requires the LiveU USB driver pack for direct USB mode.
`,
    category: 'Automation',
    type: ToolType.desktop,
    version: '5.0.1',
    owner: 'Itai Levi',
    ownerContact: 'itai.levi@liveu.tv',
    screenshots: [],
    downloadUrl: '',
  },
]

async function main() {
  const count = await prisma.tool.count()
  if (count > 0) {
    console.log(`Database already has ${count} tools — skipping seed.`)
    return
  }

  console.log('Seeding database with example tools...')
  for (const tool of tools) {
    await prisma.tool.create({ data: tool })
    console.log(`  ✓ ${tool.name}`)
  }
  console.log(`Seeded ${tools.length} tools.`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
