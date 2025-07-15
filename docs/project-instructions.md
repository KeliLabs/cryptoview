# Blockchain Investment Dashboard - Project Plan

## Project Overview
A comprehensive investment platform that provides AI-powered investment recommendations for cryptocurrencies and stocks, with real-time data analysis and user portfolio tracking.

## Target Specifications

### Phase 1: Personal Use (MVP)
- Single user blockchain investment dashboard
- Focus on Bitcoin, Ethereum, Bitcoin Cash, Litecoin
- Real-time data with manual refresh toggle
- Basic AI investment recommendations

### Phase 2: Multi-User Platform
- User authentication and account management
- Personal portfolio tracking
- Multiple user support with role-based access

### Phase 3: Advanced Features
- Stock market investing tab (initially disabled)
- Advanced LLM predictions with historical analysis
- News sentiment analysis integration

## Technical Stack

### Frontend
- **Framework**: Next.js 14+ with React 18+
- **Styling**: Tailwind CSS with dark theme
- **Charts**: Chart.js or Recharts for data visualization
- **UI Components**: shadcn/ui or Ant Design
- **State Management**: Zustand or Redux Toolkit
- **Real-time Updates**: WebSocket or Server-Sent Events

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (for Phase 2)
- **API Client**: Axios for HTTP requests
- **Background Jobs**: Bull Queue with Redis

### AI/ML Integration
- **LLM Provider**: Google Gemini API
- **Data Processing**: Python scripts for data analysis
- **Vector Database**: Pinecone or Chroma for embeddings

### External APIs
- **Blockchain Data**: Blockchair API (primary)
- **Market Data**: CoinGecko API
- **News Data**: NewsAPI or similar
- **Stock Data**: Alpha Vantage or similar (Phase 3)

## Database Schema Design

### Users Table (Phase 2)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Cryptocurrencies Table
```sql
CREATE TABLE cryptocurrencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    blockchain VARCHAR(50) NOT NULL,
    blockchair_id VARCHAR(50),
    coingecko_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Historical Data Table
```sql
CREATE TABLE historical_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crypto_id UUID REFERENCES cryptocurrencies(id),
    price DECIMAL(20,8),
    market_cap BIGINT,
    volume_24h BIGINT,
    block_count INTEGER,
    transaction_count INTEGER,
    hash_rate BIGINT,
    timestamp TIMESTAMP NOT NULL,
    data_source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Portfolio Table (Phase 2)
```sql
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    crypto_id UUID REFERENCES cryptocurrencies(id),
    quantity DECIMAL(20,8) NOT NULL,
    average_buy_price DECIMAL(20,8),
    last_updated TIMESTAMP DEFAULT NOW()
);
```

### AI Predictions Table
```sql
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crypto_id UUID REFERENCES cryptocurrencies(id),
    prediction_type VARCHAR(50), -- 'price', 'trend', 'recommendation'
    predicted_value DECIMAL(20,8),
    confidence_score DECIMAL(5,4),
    reasoning TEXT,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### News Sentiment Table
```sql
CREATE TABLE news_sentiment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crypto_id UUID REFERENCES cryptocurrencies(id),
    headline TEXT NOT NULL,
    url VARCHAR(500),
    sentiment_score DECIMAL(5,4), -- -1 to 1
    source VARCHAR(100),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Integration Strategy

### Blockchair API Integration
- **Endpoints to Use**:
  - `/stats` - General blockchain statistics
  - `/dashboards/{blockchain}/stats` - Specific blockchain stats
  - `/dashboards/{blockchain}/address/{address}` - Address tracking
  - `/premium/stats` - Premium features for advanced analytics

### CoinGecko API Integration
- **Endpoints to Use**:
  - `/coins/markets` - Market data
  - `/coins/{id}/market_chart` - Historical price data
  - `/coins/{id}/tickers` - Trading data
  - `/global` - Global market statistics

### Google Gemini Integration
- **Use Cases**:
  - Market trend analysis
  - Investment recommendation generation
  - News sentiment analysis
  - Risk assessment based on historical patterns

## Project Structure

```
blockchain-investment-dashboard/
├── src/
│   ├── app/                    # Next.js 14 app router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── auth/             # Authentication pages
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Reusable UI components
│   │   ├── charts/          # Chart components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── ui/              # Base UI components
│   ├── lib/                 # Utility functions
│   │   ├── api/            # API clients
│   │   ├── database/       # Database utilities
│   │   └── ai/             # AI/ML utilities
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── scripts/               # Build and deployment scripts
└── docs/                  # Project documentation
```

## Implementation Roadmap

### Week 1-2: Project Setup & Core Infrastructure
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up PostgreSQL database and Prisma ORM
- [ ] Configure Tailwind CSS with dark theme
- [ ] Set up basic project structure and routing
- [ ] Create environment configuration

### Week 3-4: Data Layer & API Integration
- [ ] Implement Blockchair API client
- [ ] Create database models and migrations
- [ ] Set up data fetching and caching layer
- [ ] Implement basic CRUD operations
- [ ] Add CoinGecko API integration

### Week 5-6: Dashboard UI Development
- [ ] Create main dashboard layout
- [ ] Implement cryptocurrency cards/tiles
- [ ] Add price charts and historical data visualization
- [ ] Create refresh toggle functionality
- [ ] Implement responsive design

### Week 7-8: AI Integration & Predictions
- [ ] Set up Google Gemini API client
- [ ] Implement basic investment recommendation logic
- [ ] Create prediction display components
- [ ] Add confidence scoring system
- [ ] Implement real-time data analysis

### Week 9-10: Advanced Features
- [ ] Add news sentiment analysis
- [ ] Implement portfolio tracking foundation
- [ ] Create notification system
- [ ] Add data export functionality
- [ ] Performance optimization

### Week 11-12: Multi-User Preparation
- [ ] Implement NextAuth.js authentication
- [ ] Add user management system
- [ ] Create user-specific dashboards
- [ ] Implement role-based access control
- [ ] Add user preferences and settings

## Key Features Breakdown

### 1. Real-Time Dashboard
- **Live price updates** with WebSocket connections
- **Interactive charts** showing price history, volume, market cap
- **Blockchain metrics** (hash rate, transaction count, block time)
- **Manual refresh toggle** with auto-refresh intervals

### 2. AI-Powered Recommendations
- **Investment suggestions** based on technical analysis
- **Risk assessment** using historical volatility
- **Market sentiment** analysis from news and social media
- **Confidence scoring** for each recommendation

### 3. Portfolio Management (Phase 2)
- **Holdings tracking** with profit/loss calculations
- **Performance analytics** with benchmarking
- **Alert system** for price targets and significant changes
- **Transaction history** and tax reporting

### 4. News & Sentiment Analysis
- **Curated news feed** for each cryptocurrency
- **Sentiment scoring** using NLP
- **Impact analysis** on price movements
- **Trend correlation** with market data

## Environment Variables Setup

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crypto_dashboard"

# API Keys
BLOCKCHAIR_API_KEY="your_blockchair_api_key"
COINGECKO_API_KEY="your_coingecko_api_key"
GEMINI_API_KEY="your_gemini_api_key"
NEWS_API_KEY="your_news_api_key"

# Authentication (Phase 2)
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis (for caching and jobs)
REDIS_URL="redis://localhost:6379"
```

## Risk Considerations & Mitigation

### Technical Risks
- **API rate limits**: Implement caching and request queuing
- **Data accuracy**: Use multiple data sources for validation
- **Scalability**: Design for horizontal scaling from the start

### Business Risks
- **Market volatility**: Clear disclaimers about investment risks
- **Regulatory compliance**: Research financial advisory regulations
- **Data privacy**: Implement proper security measures

### AI/ML Risks
- **Model bias**: Regular model evaluation and retraining
- **Prediction accuracy**: Clear confidence intervals and disclaimers
- **Hallucination**: Implement guardrails and validation

## Success Metrics

### Phase 1 (Personal Use)
- Dashboard loads in under 2 seconds
- 99.9% uptime for data fetching
- AI recommendations with >60% accuracy
- Mobile-responsive design

### Phase 2 (Multi-User)
- Support for 100+ concurrent users
- User authentication with <1 second login
- Personalized dashboards for each user
- Portfolio tracking accuracy >99%

## Next Steps

1. **Create the Next.js project** with the specified tech stack
2. **Set up the database** with initial schema
3. **Implement basic Blockchair API integration**
4. **Create the dashboard UI foundation**
5. **Add Google Gemini integration for AI features**

This plan provides a solid foundation for building a professional-grade blockchain investment dashboard that can scale from personal use to a multi-user platform while incorporating cutting-edge AI capabilities.