# 🚀 Deployment Checklist

## ✅ Pre-Deployment (GitHub)

- [ ] All files are committed and pushed to GitHub
- [ ] `netlify/functions/` folder is in repository root
- [ ] `database-schema.sql` is included
- [ ] `index-db.html` is the main dashboard file

## ✅ Post-Deployment (Netlify)

### 1. Environment Variables
- [ ] Go to Netlify Dashboard → Site Settings → Environment Variables
- [ ] Add: `NETLIFY_DATABASE_URL` = your Neon connection string
- [ ] Redeploy the site (trigger a new deployment)

### 2. Verify Netlify Functions
- [ ] Check Functions tab in Netlify dashboard
- [ ] Verify `db` function is deployed
- [ ] Test function endpoint: `https://yoursite.netlify.app/.netlify/functions/db`

### 3. Database Setup
- [ ] Run `database-schema.sql` in Neon SQL editor
- [ ] Verify tables are created: `clients`, `logs`, `cycles`
- [ ] Check that indexes are created

### 4. Test Dashboard
- [ ] Open your deployed dashboard
- [ ] Check browser console for errors
- [ ] Try adding a client
- [ ] Try adding a work log
- [ ] Verify data persists between page refreshes

## 🚨 Common Issues & Solutions

### Function Not Found (404)
```bash
# Check if function exists
curl https://yoursite.netlify.app/.netlify/functions/db
```

### Database Connection Error
- Verify `NETLIFY_DATABASE_URL` is set correctly
- Check Neon database is accessible
- Ensure schema is created

### CORS Issues
- Function includes CORS headers
- Check browser console for specific errors

## 📊 Monitoring

- [ ] Check Netlify function logs
- [ ] Monitor function execution times
- [ ] Verify database queries are working
- [ ] Test all CRUD operations

## 🎯 Success Criteria

- [ ] Dashboard loads without errors
- [ ] Clients can be added/edited/deleted
- [ ] Work logs can be created and managed
- [ ] Paid cycles can be created
- [ ] Invoices generate correctly
- [ ] Data persists in database
- [ ] No localStorage errors in console

## 🔧 Debug Commands

```bash
# Test function directly
curl -X GET https://yoursite.netlify.app/.netlify/functions/db/all

# Test with data
curl -X POST https://yoursite.netlify.app/.netlify/functions/db/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","type":"Website"}'
```

## 📞 Support

If issues persist:
1. Check Netlify function logs
2. Verify environment variables
3. Test database connection
4. Check browser console errors
5. Review function deployment status
