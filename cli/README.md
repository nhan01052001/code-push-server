# CodePush CLI

Command Line Interface để tương tác với CodePush Server, cho phép developers quản lý apps, deployments và releases từ terminal.

## 🚀 Công nghệ sử dụng

- **Node.js** (>= 16.x) với TypeScript
- **Commander.js** - CLI framework
- **Chalk** - Terminal styling
- **Table** - Display data in tables
- **Prompt** - Interactive prompts
- **Superagent** - HTTP client

## 🎯 Chức năng chính

### 1. Authentication
- Login/Logout với access tokens
- Quản lý sessions
- Support multiple accounts

### 2. App Management
- Tạo, liệt kê, xóa apps
- Quản lý collaborators
- Transfer ownership

### 3. Deployment Management
- Tạo và quản lý deployments
- View deployment keys
- Clear deployment history

### 4. Release Management
- Release updates cho deployments
- Rollback releases
- Promote releases giữa environments
- View release history

### 5. Debugging & Metrics
- Debug mode cho troubleshooting
- View deployment metrics
- Session logs

## 📦 Cài đặt

### Global Installation
```bash
npm install -g code-push-cli
```

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd cli

# Install dependencies
npm install

# Build
npm run build

# Link globally
npm link
```

## 🔧 Cấu hình

### Server Configuration
Mặc định, CLI sẽ kết nối đến Microsoft CodePush server. Để sử dụng với self-hosted server:

```bash
code-push set-server-url http://your-server-url:3000
```

### Authentication
```bash
# Login với access token
code-push login --accessKey YOUR_ACCESS_KEY

# Login interactive (mở browser)
code-push login
```

## 🚀 Sử dụng

### Basic Commands

#### Authentication
```bash
# Login
code-push login

# Logout
code-push logout

# Whoami - xem current user
code-push whoami
```

#### App Management
```bash
# List apps
code-push app ls

# Add new app
code-push app add MyApp-iOS ios react-native
code-push app add MyApp-Android android react-native

# Remove app
code-push app rm MyApp-iOS

# Rename app
code-push app rename MyApp-iOS MyApp-iOS-New
```

#### Deployment Management
```bash
# List deployments
code-push deployment ls MyApp-iOS

# Add deployment
code-push deployment add MyApp-iOS QA

# Remove deployment
code-push deployment rm MyApp-iOS QA

# Rename deployment
code-push deployment rename MyApp-iOS Staging Development

# View deployment keys
code-push deployment ls MyApp-iOS --displayKeys
```

#### Release Management
```bash
# Release an update
code-push release-react MyApp-iOS ios -d Production

# Release với specific options
code-push release-react MyApp-iOS ios \
  -d Production \
  -m \
  --description "Critical bug fixes" \
  --targetBinaryVersion "~1.0.0"

# Release bundle file
code-push release MyApp-iOS ./bundle.zip 1.0.0 \
  -d Production \
  --mandatory

# Rollback release
code-push rollback MyApp-iOS Production

# Promote release
code-push promote MyApp-iOS Staging Production
```

#### Metrics & History
```bash
# View deployment history
code-push deployment history MyApp-iOS Production

# View deployment metrics
code-push deployment ls MyApp-iOS --displayKeys

# Clear deployment history
code-push deployment clear MyApp-iOS Production
```

### Advanced Usage

#### Multi-deployment workflow
```bash
# 1. Release to Staging
code-push release-react MyApp-iOS ios -d Staging

# 2. Test in Staging
# ... testing ...

# 3. Promote to Production
code-push promote MyApp-iOS Staging Production

# 4. If issues, rollback
code-push rollback MyApp-iOS Production
```

#### Targeted releases
```bash
# Release only to specific binary versions
code-push release-react MyApp-iOS ios \
  -d Production \
  --targetBinaryVersion ">=1.0.0 <2.0.0"

# Phased rollout (25% users)
code-push patch MyApp-iOS Production -r 25
```

## 📚 Command Reference

### Global Options
- `--accessKey <key>` - Access key for authentication
- `--serverUrl <url>` - Override server URL
- `--proxy <url>` - Use proxy server
- `--noProxy` - Disable proxy

### Commands

#### `login`
```bash
code-push login [--accessKey <key>]
```

#### `logout`
```bash
code-push logout [--local]
```

#### `app`
```bash
# Add
code-push app add <appName> <os> <platform>

# List
code-push app ls [--format <format>]

# Remove
code-push app rm <appName>

# Rename
code-push app rename <currentName> <newName>

# Transfer
code-push app transfer <appName> <email>
```

#### `deployment`
```bash
# Add
code-push deployment add <appName> <deploymentName>

# List
code-push deployment ls <appName> [--displayKeys]

# Remove
code-push deployment rm <appName> <deploymentName>

# Rename
code-push deployment rename <appName> <currentName> <newName>

# History
code-push deployment history <appName> <deploymentName>

# Clear
code-push deployment clear <appName> <deploymentName>
```

#### `release`
```bash
# Release update
code-push release <appName> <updateContents> <targetBinaryVersion>
  [-d <deploymentName>]
  [-m|--mandatory]
  [--description <description>]
  [--disabled]
  [--rollout <percentage>]

# Release React Native
code-push release-react <appName> <platform>
  [-d <deploymentName>]
  [-m|--mandatory]
  [--description <description>]
  [--targetBinaryVersion <version>]
  [--bundleName <bundleName>]
  [--entryFile <entryFile>]
  [--sourcemapOutput <path>]
```

#### `patch`
```bash
code-push patch <appName> <deploymentName>
  [--label <label>]
  [--description <description>]
  [--disabled]
  [--mandatory]
  [--rollout <percentage>]
```

#### `promote`
```bash
code-push promote <appName> <sourceDeploymentName> <destDeploymentName>
  [--description <description>]
  [--disabled]
  [--mandatory]
  [--rollout <percentage>]
```

#### `rollback`
```bash
code-push rollback <appName> <deploymentName> [--targetRelease <label>]
```

## 🏗️ Project Structure

```
cli/
├── script/
│   ├── cli.ts              # Main CLI entry
│   ├── command-executor.ts # Command execution logic
│   ├── command-parser.ts   # Command parsing
│   ├── commands/           # Individual commands
│   │   └── debug.ts
│   ├── management-sdk.ts   # API client
│   └── utils/              # Utility functions
├── test/                   # Test files
├── package.json
└── tsconfig.json
```

## 🔒 Security

1. **Access Keys**: Lưu trữ an toàn, không commit vào source control
2. **HTTPS**: Sử dụng HTTPS cho production servers
3. **Session Management**: Logout khi không sử dụng

## 🐛 Troubleshooting

### Authentication Issues
```bash
# Check current user
code-push whoami

# Re-login
code-push logout
code-push login
```

### Network Issues
```bash
# Use debug mode
code-push deployment ls MyApp --debug

# Check server URL
code-push set-server-url
```

### Release Issues
```bash
# Verify deployment exists
code-push deployment ls MyApp

# Check deployment history
code-push deployment history MyApp Production
```

## 📄 License

MIT License - xem [LICENSE.txt](../LICENSE.txt)