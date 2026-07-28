const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const uploadFileToSupabase = async (file) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase configuration is missing');
    }

    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'project-images';
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) {
        throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
};

module.exports = {
    uploadFileToSupabase,
};
