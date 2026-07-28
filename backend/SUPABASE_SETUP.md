# Supabase setup for project images

1. Create a Supabase project at https://supabase.com
2. Go to Storage
3. Create a new bucket named `project-images`
4. Make the bucket public
5. Go to Settings -> API
6. Copy:
   - Project URL
   - service_role key
7. Put them in `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=project-images
```

The backend will upload the image file to Supabase Storage and save the returned public URL in the PostgreSQL `projects.image` column.
