# Blockchain Investment Dashboard

A comprehensive investment platform that provides AI-powered investment recommendations for cryptocurrencies and stocks, with real-time data analysis and user portfolio tracking.

## 🚀 Quick Start

### Prerequisites
- VS Code with Dev Containers extension
- Docker Desktop running

### Setup Instructions

1. **Open in Dev Container**
   - Open this project in VS Code
   - When prompted, click "Reopen in Container"
   - Wait for the container to build and post-create script to run

2. **Environment Configuration**
   - Copy `base-codebase/.env.example` to `base-codebase/.env`
   - Add your API keys:
     ```bash
     cd base-codebase
     cp .env.example .env
     # Edit .env file with your API keys
     ```

3. **Database Setup**
   - The PostgreSQL and Redis containers are automatically started
   - Run database migrations:
     ```bash
     cd base-codebase
     npx prisma db push
     ```

4. **Start Development Server**
   ```bash
   cd base-codebase
   npm run dev
   ```
   - Open <http://localhost:3000> in your browser

## 🛠️ Quick Commands

Use the helper script for easier development:
```bash
# Start development server
./scripts/dev-helper.sh dev

# Run Prisma commands
./scripts/dev-helper.sh prisma studio
./scripts/dev-helper.sh prisma db push

# Install dependencies
./scripts/dev-helper.sh install

# Open shell in project directory
./scripts/dev-helper.sh shell
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ with React 18+
- **Styling**: Tailwind CSS with dark theme
- **Charts**: Chart.js/Recharts for data visualization
- **UI Components**: Radix UI components
- **State Management**: Zustand
- **TypeScript**: Full type safety

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for caching and background jobs
- **API Client**: Axios for HTTP requests

### AI/ML Integration
- **LLM Provider**: Google Gemini API
- **Data Processing**: Python scripts for analysis
- **Libraries**: scikit-learn, pandas, numpy

### External APIs
- **Blockchain Data**: Blockchair API
- **Market Data**: CoinGecko API
- **News Data**: NewsAPI
- **AI**: Google Gemini API

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 app router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions
│   ├── api/             # API clients
│   ├── database/        # Database utilities
│   └── ai/              # AI/ML utilities
├── hooks/               # Custom React hooks
└── types/               # TypeScript definitions
```

## 🔧 Development Commands

All commands should be run from the `base-codebase` directory:

```bash
cd base-codebase

# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma db push      # Push schema changes
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Create and run migrations

# Code Quality
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript checks
```

Or use the helper script from the root directory:
```bash
./scripts/dev-helper.sh dev        # Start development server
./scripts/dev-helper.sh prisma studio  # Open database GUI
./scripts/dev-helper.sh shell      # Open shell in project directory
```

## 🐳 Container Services

The dev container automatically starts:
- **PostgreSQL**: Port 5432 (Database)
- **Redis**: Port 6379 (Cache)
- **Next.js**: Port 3000 (Web server)

## 🔑 API Keys Required

1. **Blockchair API**: Get from https://blockchair.com/api
2. **CoinGecko API**: Get from https://www.coingecko.com/api
3. **Google Gemini API**: Get from https://makersuite.google.com/app/apikey
4. **News API**: Get from https://newsapi.org/

## 📊 Features

### Phase 1 (Current)
- ✅ Real-time cryptocurrency dashboard
- ✅ Price charts and historical data
- ✅ AI-powered investment recommendations
- ✅ News sentiment analysis
- ✅ Manual refresh toggle

### Phase 2 (Planned)
- 🔄 User authentication
- 🔄 Portfolio tracking
- 🔄 Multi-user support
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📅 Stock market integration
- 📅 Advanced ML predictions
- 📅 Real-time notifications
- 📅 Mobile app

## 🚨 Important Notes

1. **API Rate Limits**: Be mindful of API rate limits
2. **Environment Variables**: Never commit `.env` to version control
3. **Database**: PostgreSQL data persists in Docker volumes
4. **Cache**: Redis is used for caching API responses
5. **AI**: Gemini API requires proper configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Container Issues
- Rebuild container: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"
- Check Docker Desktop is running
- Ensure ports 3000, 5432, 6379 are available

### Database Issues
- Check PostgreSQL container: `docker ps | grep postgres`
- Reset database: `docker rm -f cryptoview-postgres` and restart container
- View logs: `docker logs cryptoview-postgres`
- Run migrations: `cd base-codebase && npx prisma db push`

### API Issues
- Verify API keys in `base-codebase/.env` file
- Check API rate limits
- Review network connectivity

### Build Issues
- Clear node_modules: `cd base-codebase && rm -rf node_modules && npm install`
- Clear Next.js cache: `cd base-codebase && rm -rf .next`
- Regenerate Prisma client: `cd base-codebase && npx prisma generate`

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the project documentation
3. Create an issue in the repository
4. Contact the development team

---

**Happy Coding! 🎉**
