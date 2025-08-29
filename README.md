# Sixty4Bit Dashboard - Neon PostgreSQL Version

A modern freelancer dashboard with client management, work logs, and invoice generation, now powered by Neon PostgreSQL database.

## 🚀 Features

- **Client Management**: Add, edit, and delete clients with project types and domains
- **Work Logs**: Track tasks, set prices, and manage payment status
- **Paid Cycles**: Create invoice cycles and generate PDF invoices
- **Dashboard Analytics**: Revenue charts and client distribution
- **Responsive Design**: Modern UI with TailwindCSS and dark/light themes
- **Database Backend**: PostgreSQL database with Netlify Functions

## 🗄️ Database Schema

### Tables

1. **clients**
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR(255))
   - `type` (VARCHAR(100))
   - `domain` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **logs**
   - `id` (SERIAL PRIMARY KEY)
   - `client_id` (INTEGER REFERENCES clients(id))
   - `task_type` (VARCHAR(100))
   - `details` (TEXT)
   - `date` (DATE)
   - `amount` (DECIMAL(10,2))
   - `paid` (BOOLEAN)
   - `timestamp` (TIMESTAMP)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **cycles**
   - `id` (SERIAL PRIMARY KEY)
   - `client_id` (INTEGER REFERENCES clients(id))
   - `log_ids` (JSONB - array of log IDs)
   - `total` (DECIMAL(10,2))
   - `date` (DATE)
   - `created_at`, `updated_at` (TIMESTAMP)

## 🛠️ Setup Instructions

### 1. Neon Database Setup

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@host/database`)
4. Run the SQL schema from `database-schema.sql` in your Neon SQL editor

### 2. Netlify Deployment

1. **Push to GitHub** (as you mentioned, this will auto-deploy to Netlify)

2. **Set Environment Variables** in Netlify:
   - Go to your Netlify site dashboard
   - Navigate to Site settings > Environment variables
   - Add: `NETLIFY_DATABASE_URL` = your Neon connection string

3. **Install Dependencies**:
   - Netlify will automatically install the `@neondatabase/serverless` package from the `netlify/functions/package.json`

### 3. Manual Steps Required

After deployment, you need to:

1. **Verify Netlify Functions**:
   - Check that your function is deployed at `/.netlify/functions/db`
   - Test with: `https://yoursite.netlify.app/.netlify/functions/db`

2. **Test Database Connection**:
   - Open your dashboard
   - Check browser console for any database connection errors
   - Try adding a client to test the full flow

3. **Monitor Function Logs**:
   - In Netlify dashboard, go to Functions tab
   - Check for any errors in the function logs

## 🔧 API Endpoints

The Netlify Function handles these endpoints:

- `GET /.netlify/functions/db/all` - Get all data
- `GET /.netlify/functions/db/clients` - Get all clients
- `POST /.netlify/functions/db/clients` - Create client
- `PUT /.netlify/functions/db/clients` - Update client
- `DELETE /.netlify/functions/db/clients` - Delete client
- `GET /.netlify/functions/db/logs` - Get all logs
- `POST /.netlify/functions/db/logs` - Create log
- `PUT /.netlify/functions/db/logs` - Update log
- `DELETE /.netlify/functions/db/logs` - Delete log
- `GET /.netlify/functions/db/cycles` - Get all cycles
- `POST /.netlify/functions/db/cycles` - Create cycle
- `PUT /.netlify/functions/db/cycles` - Update cycle
- `DELETE /.netlify/functions/db/cycles` - Delete cycle

## 📁 File Structure

```
dashboard/
├── index-db.html          # Updated dashboard with database integration
├── netlify/
│   └── functions/
│       ├── db.js          # Database API handler
│       └── package.json   # Function dependencies
├── database-schema.sql    # Database setup script
└── README.md             # This file
```

## 🚨 Troubleshooting

### Common Issues:

1. **Function not found (404)**:
   - Check that `netlify/functions/` folder is in your repository root
   - Verify the function is deployed in Netlify Functions tab

2. **Database connection error**:
   - Verify `NETLIFY_DATABASE_URL` environment variable is set
   - Check that your Neon database is accessible
   - Ensure the schema has been created

3. **CORS errors**:
   - The function includes CORS headers, but check browser console for any issues

4. **Data not loading**:
   - Check browser console for API errors
   - Verify the function is returning data correctly
   - Check Netlify function logs

## 🔄 Migration from localStorage

The updated dashboard automatically:
- Loads data from the database instead of localStorage
- Saves all CRUD operations to the database
- Maintains theme preference in localStorage
- Provides the same UI/UX experience

## 📊 Performance Notes

- Database queries are optimized with proper indexes
- Netlify Functions have cold start times (~100-200ms)
- Consider implementing caching for frequently accessed data
- Monitor function execution times in Netlify dashboard

## 🆘 Support

If you encounter issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test database connection directly
4. Check browser console for errors

## 🎯 Next Steps

After successful deployment:
1. Test all CRUD operations
2. Verify invoice generation works
3. Check that data persists between sessions
4. Monitor function performance
5. Consider adding data backup/restore features
