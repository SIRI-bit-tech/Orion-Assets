# Orion Assets Broker - Production Setup Guide

This guide covers the complete setup and deployment of Orion Assets Broker for production environments.

## 🏗️ Prerequisites

- Node.js 18+ or 20+
- MongoDB 6.0+ (Atlas or self-hosted)
- SSL certificate for HTTPS
- Email service provider (for notifications)
- Domain name and DNS configuration

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orion-assets-broker?retryWrites=true&w=majority
MONGODB_DB=orion-assets-broker

# Authentication Configuration
BETTER_AUTH_SECRET=your-super-secure-32+-character-secret-key-here
BETTER_AUTH_URL=https://yourdomain.com

# Application Configuration
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com

# Email Configuration (Optional but recommended)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@yourdomain.com
EMAIL_SERVER_PASSWORD=your-app-password

# Security Configuration
WEBHOOK_SECRET=your-webhook-secret-here

# External API Keys (if using market data)
MARKET_DATA_API_KEY=your-market-data-api-key
TRADING_API_KEY=your-trading-api-key
TRADING_API_SECRET=your-trading-api-secret

# Monitoring and Logging
LOG_LEVEL=error
ENABLE_ANALYTICS=true

# Rate Limiting
RATE_LIMIT_REDIS_URL=redis://localhost:6379 # Optional: for distributed rate limiting
```

### Environment Variable Security

1. **BETTER_AUTH_SECRET**: Must be at least 32 characters long, cryptographically secure
2. **MONGODB_URI**: Use MongoDB Atlas with IP whitelisting for production
3. **API Keys**: Store in secure environment variable management system
4. **Never commit**: `.env.local` or any file containing secrets to version control

## 🗄️ Database Setup

### MongoDB Atlas Setup (Recommended)

1. **Create MongoDB Atlas Account**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (M10+ recommended for production)

2. **Database Configuration**
   ```bash
   Database Name: orion-assets-broker
   Collections: Created automatically on first use
   ```

3. **Security Settings**
   - Enable authentication
   - Set up IP whitelisting
   - Use strong database user credentials
   - Enable backup (Point-in-time recovery recommended)

4. **Connection String**
   ```
   mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   ```

### Database Collections

The following collections will be created automatically:

- `users` - User accounts and profiles
- `sessions` - Authentication sessions
- `accounts` - Trading accounts
- `orders` - Trade orders
- `positions` - Trading positions
- `trades` - Executed trades
- `watchlist` - User watchlists
- `audit_logs` - System audit trail
- `market_data` - Market price data
- `securities` - Security information

### Database Indexes

Indexes are automatically created for optimal performance:

```javascript
// Users collection
{ email: 1 } (unique)
{ role: 1 }

// Orders collection
{ userId: 1 }
{ accountId: 1 }
{ status: 1 }
{ symbol: 1 }
{ placedAt: -1 }

// Positions collection
{ userId: 1 }
{ accountId: 1 }
{ symbol: 1 }
{ status: 1 }
{ userId: 1, symbol: 1, status: 1 } (compound)

// Additional indexes for trades, audit logs, etc.
```

## 🔐 Authentication System

### Better-Auth Configuration

The application uses Better-Auth for secure authentication with the following features:

1. **Email/Password Authentication**
   - Secure password hashing
   - Password strength requirements
   - Account lockout after failed attempts

2. **Session Management**
   - JWT-based sessions
   - 7-day session expiry
   - Secure cookie configuration
   - Cross-subdomain support

3. **Security Features**
   - Rate limiting on login attempts
   - Email verification (production)
   - Password reset functionality
   - Audit logging for all auth events

4. **User Roles and Permissions**
   - `USER` - Standard trading access
   - `ADMIN` - Administrative access
   - `DEMO` - Demo account access
   - `SUSPENDED` - Suspended account

### Authentication Flow

```
1. User Registration → Email Verification → Account Creation
2. User Login → Session Creation → API Access
3. Protected Routes → Session Validation → Resource Access
4. User Logout → Session Invalidation → Cleanup
```

## 🚀 Deployment Process

### 1. Pre-deployment Checks

Run the production readiness check:

```bash
npm run db:production-check
```

This validates:
- ✅ Environment variables
- ✅ Database connectivity
- ✅ Required collections
- ✅ Database indexes
- ✅ Authentication configuration
- ✅ Data integrity
- ✅ Security settings
- ✅ Performance metrics

### 2. Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### 3. SSL Certificate Setup

Ensure HTTPS is properly configured:

```bash
# Using Let's Encrypt with Certbot
certbot --nginx -d yourdomain.com

# Or configure your load balancer/CDN for SSL termination
```

### 4. Health Checks

Set up monitoring endpoints:

```bash
GET /api/health - Application health
GET /api/auth/session - Authentication status
```

## 🛡️ Security Checklist

### Pre-production Security Audit

- [ ] Environment variables properly secured
- [ ] Database access restricted by IP
- [ ] SSL/HTTPS properly configured
- [ ] Authentication secret is strong (32+ chars)
- [ ] Rate limiting enabled
- [ ] No default admin accounts
- [ ] Audit logging enabled
- [ ] Error messages don't expose sensitive data
- [ ] CORS properly configured
- [ ] Security headers implemented

### Runtime Security

- [ ] Regular security updates
- [ ] Database backup strategy
- [ ] Log monitoring and alerts
- [ ] Intrusion detection
- [ ] Regular penetration testing

## 📊 Monitoring and Maintenance

### Database Monitoring

Monitor these key metrics:

1. **Connection Pool**
   - Active connections
   - Connection wait time
   - Pool exhaustion alerts

2. **Query Performance**
   - Average query time
   - Slow query alerts
   - Index utilization

3. **Storage**
   - Database size growth
   - Index size
   - Backup completion

### Application Monitoring

Track these application metrics:

1. **Authentication**
   - Login success/failure rates
   - Session creation/expiry
   - Failed login attempts

2. **API Performance**
   - Response times
   - Error rates
   - Rate limit hits

3. **Business Metrics**
   - User registrations
   - Active sessions
   - Trading activity

### Log Management

Configure structured logging:

```javascript
// Log levels
ERROR - Critical issues requiring immediate attention
WARN  - Potential issues or security events
INFO  - General application flow
DEBUG - Development debugging (disabled in production)
```

## 🔄 Backup and Recovery

### Database Backup Strategy

1. **Automated Backups**
   - Enable MongoDB Atlas automatic backups
   - Configure backup retention (recommended: 30 days)
   - Set up point-in-time recovery

2. **Backup Testing**
   - Monthly restore tests
   - Document recovery procedures
   - Test disaster recovery scenarios

3. **Data Export**
   ```bash
   # Export specific collections
   mongodump --uri="$MONGODB_URI" --collection=users
   mongodump --uri="$MONGODB_URI" --collection=accounts
   ```

### Application Recovery

1. **Configuration Backup**
   - Environment variables
   - Deployment scripts
   - SSL certificates

2. **Code Repository**
   - Use version control (Git)
   - Tag production releases
   - Maintain deployment documentation

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```
   Error: Authentication failed
   Solution: Check MongoDB credentials and IP whitelist
   ```

2. **Authentication Issues**
   ```
   Error: Invalid session
   Solution: Check BETTER_AUTH_SECRET and session configuration
   ```

3. **Performance Issues**
   ```
   Problem: Slow API responses
   Solution: Check database indexes and connection pool size
   ```

### Debug Tools

```bash
# Check production readiness
npm run db:production-check

# Test database connection
node -e "require('./lib/db/mongodb').testDatabaseConnection().then(console.log)"

# Verify authentication
node -e "require('./lib/auth/config').auth.api.getSession().then(console.log)"
```

## 📈 Scaling Considerations

### Database Scaling

1. **Vertical Scaling**
   - Increase MongoDB Atlas cluster tier
   - Add more CPU/RAM as needed

2. **Horizontal Scaling**
   - MongoDB sharding for very large datasets
   - Read replicas for read-heavy workloads

3. **Connection Pooling**
   - Optimize connection pool settings
   - Monitor connection utilization

### Application Scaling

1. **Load Balancing**
   - Use multiple application instances
   - Configure session stickiness if needed

2. **Caching Strategy**
   - Redis for session storage
   - CDN for static assets
   - Database query caching

3. **Performance Optimization**
   - Database query optimization
   - Index tuning
   - Connection pooling

## 📞 Support and Maintenance

### Regular Maintenance Tasks

- [ ] Monthly security updates
- [ ] Quarterly performance reviews
- [ ] Annual security audits
- [ ] Backup restoration tests
- [ ] Database index maintenance
- [ ] Log rotation and cleanup

### Emergency Procedures

1. **Database Issues**
   - Contact MongoDB Atlas support
   - Implement read-only mode
   - Restore from backup if needed

2. **Authentication Issues**
   - Check session storage
   - Verify authentication configuration
   - Clear problematic sessions

3. **Security Incidents**
   - Immediate account suspension
   - Security log analysis
   - Incident response procedures

---

## 🎯 Final Checklist

Before going live, ensure all items are completed:

- [ ] Environment variables configured and secured
- [ ] Database connection tested and optimized
- [ ] Authentication system tested end-to-end
- [ ] SSL/HTTPS properly configured
- [ ] Security measures implemented
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented and tested
- [ ] Documentation updated and accessible
- [ ] Support procedures documented
- [ ] Performance benchmarks established

**🚀 Your Orion Assets Broker is now ready for production!**