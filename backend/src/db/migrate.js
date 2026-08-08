import { query } from './pool.js';

const createTables = async () => {
  const sql = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Career profiles table
    CREATE TABLE IF NOT EXISTS career_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      about TEXT,
      target_roles TEXT[],
      skills TEXT[],
      experience JSONB DEFAULT '[]',
      education JSONB DEFAULT '[]',
      projects JSONB DEFAULT '[]',
      certifications TEXT[],
      resume_url TEXT,
      resume_text TEXT,
      ai_summary TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Jobs table
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      employment_type VARCHAR(100),
      salary_range VARCHAR(255),
      description TEXT,
      responsibilities TEXT[],
      requirements TEXT[],
      skills TEXT[],
      experience_level VARCHAR(100),
      posted_at TIMESTAMP DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE,
      logo_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Applications table
    CREATE TABLE IF NOT EXISTS applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'saved' CHECK (status IN ('saved','applied','interview','offer','rejected')),
      match_score INTEGER DEFAULT 0,
      matching_skills TEXT[],
      missing_skills TEXT[],
      ai_explanation TEXT,
      cover_letter TEXT,
      notes TEXT,
      applied_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Cover letters table
    CREATE TABLE IF NOT EXISTS cover_letters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      ai_suggestions JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_career_profiles_user_id ON career_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
  `;

  try {
    await query(sql);
    console.log('✅ Database tables created successfully');
  } catch (err) {
    console.error('❌ Migration error:', err);
    throw err;
  }
};

createTables().then(() => {
  console.log('Migration complete');
  process.exit(0);
}).catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
