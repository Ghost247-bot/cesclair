# Database Migration Guide

## Migration File
`drizzle/0002_cheerful_blink.sql`

## What This Migration Does

### Primary Change
- **Adds `phone` column to `user` table**: `ALTER TABLE "user" ADD COLUMN "phone" text;`

### Note on Migration File
The migration file also includes CREATE TABLE statements for tables that may already exist in your database:
- `cart_items`
- `newsletter_subscriptions`
- `order_items`
- `orders`
- `shipping_addresses`

**If these tables already exist**, you can either:
1. Run only the ALTER TABLE statement manually
2. Use `drizzle-kit push` which will handle existing tables gracefully
3. Manually execute just the phone column addition

## Running the Migration

### Option 1: Using Drizzle Kit (Recommended)
```bash
npx drizzle-kit push
```

This will:
- Check existing schema
- Apply only necessary changes
- Handle existing tables gracefully

### Option 2: Manual SQL Execution
1. Connect to your Neon database
2. Run only this statement:
```sql
ALTER TABLE "user" ADD COLUMN "phone" text;
```

### Option 3: Full Migration (if tables don't exist)
If your database doesn't have the tables yet, run the entire migration file:
```bash
# Connect to your Neon database and run:
psql $DATABASE_URL -f drizzle/0002_cheerful_blink.sql
```

Or execute the SQL file in your Neon database console.

## Verifying the Migration

After running the migration, verify the phone column exists:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user' AND column_name = 'phone';
```

You should see:
```
column_name | data_type | is_nullable
------------|-----------|-------------
phone       | text      | YES
```

## Troubleshooting

### Error: Column already exists
If you get an error that the column already exists, the migration has already been applied. You can skip it.

### Error: Table doesn't exist
If you get an error that a table doesn't exist, you may need to run previous migrations first. Check the `drizzle/` directory for earlier migration files.

### Error: Permission denied
Ensure your database user has ALTER TABLE permissions.

## After Migration

1. **Test Profile Update**: 
   - Go to `/account/profile`
   - Update phone number
   - Verify it saves correctly

2. **Test Addresses**:
   - Go to `/account/addresses`
   - Add a new address
   - Verify it saves to database

3. **Test Orders**:
   - Go to `/account/orders`
   - Verify orders display (if any exist)

## Rollback (if needed)

To remove the phone column:

```sql
ALTER TABLE "user" DROP COLUMN "phone";
```

**Note**: This will delete all phone number data. Only do this if you're sure you want to remove the feature.

## Next Steps

After migration:
1. Test all account functionality
2. Verify data is being saved correctly
3. Check that API routes are working
4. Test on production/staging environment

