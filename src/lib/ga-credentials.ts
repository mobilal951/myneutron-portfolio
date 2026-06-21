import { queryMyNeutron } from "@/lib/db";

interface StoredCredentials {
  email: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  property_id: string;
}

interface GACredentials {
  accessToken: string;
  propertyId: string | null;
}

interface YouTubeCredentials {
  accessToken: string;
}

// YouTube admin email - only this account can save YouTube credentials
export const YOUTUBE_ADMIN_EMAIL = "social@vanarchain.com";

// Refresh access token using Google OAuth
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number } | { error: string }> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: "Failed to refresh token" };
    }

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    return { error: "Failed to refresh token" };
  }
}

// Get admin GA credentials from database (for all users including viewers)
export async function getAdminGACredentials(): Promise<GACredentials | null> {
  try {
    // Ensure table exists
    await queryMyNeutron(`
      CREATE TABLE IF NOT EXISTS admin_ga_credentials (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        property_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const [credentials] = await queryMyNeutron<StoredCredentials>(
      `SELECT * FROM admin_ga_credentials LIMIT 1`
    );

    if (!credentials) {
      return null;
    }

    const expiresAt = parseInt(credentials.expires_at);

    // Check if token is expired
    if (Date.now() > expiresAt) {
      // Refresh the token
      const refreshed = await refreshAccessToken(credentials.refresh_token);

      if ("error" in refreshed) {
        console.error("Failed to refresh admin token:", refreshed.error);
        return null;
      }

      // Update in database
      await queryMyNeutron(
        `UPDATE admin_ga_credentials SET access_token = $1, expires_at = $2, updated_at = NOW() WHERE email = $3`,
        [refreshed.accessToken, refreshed.expiresAt, credentials.email]
      );

      return {
        accessToken: refreshed.accessToken,
        propertyId: credentials.property_id || null,
      };
    }

    return {
      accessToken: credentials.access_token,
      propertyId: credentials.property_id || null,
    };
  } catch (error) {
    console.error("Error getting admin GA credentials:", error);
    return null;
  }
}

// Get YouTube credentials from database (separate from GA)
export async function getYouTubeCredentials(): Promise<YouTubeCredentials | null> {
  try {
    // Ensure table exists
    await queryMyNeutron(`
      CREATE TABLE IF NOT EXISTS admin_youtube_credentials (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const [credentials] = await queryMyNeutron<{
      email: string;
      access_token: string;
      refresh_token: string;
      expires_at: string;
    }>(`SELECT * FROM admin_youtube_credentials WHERE email = $1 LIMIT 1`, [YOUTUBE_ADMIN_EMAIL]);

    if (!credentials) {
      return null;
    }

    const expiresAt = parseInt(credentials.expires_at);

    // Check if token is expired
    if (Date.now() > expiresAt) {
      // Refresh the token
      const refreshed = await refreshAccessToken(credentials.refresh_token);

      if ("error" in refreshed) {
        console.error("Failed to refresh YouTube token:", refreshed.error);
        return null;
      }

      // Update in database
      await queryMyNeutron(
        `UPDATE admin_youtube_credentials SET access_token = $1, expires_at = $2, updated_at = NOW() WHERE email = $3`,
        [refreshed.accessToken, refreshed.expiresAt, credentials.email]
      );

      return {
        accessToken: refreshed.accessToken,
      };
    }

    return {
      accessToken: credentials.access_token,
    };
  } catch (error) {
    console.error("Error getting YouTube credentials:", error);
    return null;
  }
}

// Save YouTube credentials (only for YOUTUBE_ADMIN_EMAIL)
export async function saveYouTubeCredentials(
  email: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<{ success: boolean; error?: string }> {
  if (email !== YOUTUBE_ADMIN_EMAIL) {
    return { success: false, error: `Only ${YOUTUBE_ADMIN_EMAIL} can save YouTube credentials` };
  }

  try {
    await queryMyNeutron(`
      CREATE TABLE IF NOT EXISTS admin_youtube_credentials (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryMyNeutron(
      `INSERT INTO admin_youtube_credentials (email, access_token, refresh_token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         access_token = $2,
         refresh_token = $3,
         expires_at = $4,
         updated_at = NOW()`,
      [email, accessToken, refreshToken, expiresAt]
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving YouTube credentials:", error);
    return { success: false, error: "Failed to save credentials" };
  }
}

// Clear YouTube credentials (used when credentials are invalid)
export async function clearYouTubeCredentials(): Promise<void> {
  try {
    await queryMyNeutron(`DELETE FROM admin_youtube_credentials`);
    console.log("YouTube credentials cleared");
  } catch (error) {
    console.error("Error clearing YouTube credentials:", error);
  }
}

// LinkedIn admin email
export const LINKEDIN_ADMIN_EMAIL = "admin@bigimmersive.com";

// Get LinkedIn credentials from database
export async function getLinkedInCredentials(): Promise<{ accessToken: string } | null> {
  try {
    await queryMyNeutron(`
      CREATE TABLE IF NOT EXISTS admin_linkedin_credentials (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        organization_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const [credentials] = await queryMyNeutron<{
      email: string;
      access_token: string;
      expires_at: string;
      organization_id: string;
    }>(`SELECT * FROM admin_linkedin_credentials WHERE email = $1 LIMIT 1`, [LINKEDIN_ADMIN_EMAIL]);

    if (!credentials) {
      return null;
    }

    const expiresAt = parseInt(credentials.expires_at);

    // Check if token is expired (LinkedIn tokens expire in 60 days)
    if (Date.now() > expiresAt) {
      console.error("LinkedIn token expired");
      return null;
    }

    return {
      accessToken: credentials.access_token,
    };
  } catch (error) {
    console.error("Error getting LinkedIn credentials:", error);
    return null;
  }
}

// Save LinkedIn credentials
export async function saveLinkedInCredentials(
  email: string,
  accessToken: string,
  expiresAt: number,
  organizationId?: string
): Promise<{ success: boolean; error?: string }> {
  if (email !== LINKEDIN_ADMIN_EMAIL) {
    return { success: false, error: `Only ${LINKEDIN_ADMIN_EMAIL} can save LinkedIn credentials` };
  }

  try {
    await queryMyNeutron(`
      CREATE TABLE IF NOT EXISTS admin_linkedin_credentials (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        access_token TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        organization_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryMyNeutron(
      `INSERT INTO admin_linkedin_credentials (email, access_token, expires_at, organization_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         access_token = $2,
         expires_at = $3,
         organization_id = COALESCE($4, admin_linkedin_credentials.organization_id),
         updated_at = NOW()`,
      [email, accessToken, expiresAt, organizationId || null]
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving LinkedIn credentials:", error);
    return { success: false, error: "Failed to save credentials" };
  }
}

// Get Twitter/X credentials from database
export async function getTwitterCredentials(): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    await queryMyNeutron(`
      CREATE TABLE IF NOT EXISTS admin_twitter_credentials (
        id SERIAL PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const [credentials] = await queryMyNeutron<{
      access_token: string;
      refresh_token: string;
      expires_at: string;
    }>(`SELECT * FROM admin_twitter_credentials LIMIT 1`);

    if (!credentials) {
      return null;
    }

    const expiresAt = parseInt(credentials.expires_at);

    // Check if token is expired
    if (Date.now() > expiresAt && credentials.refresh_token) {
      // Refresh the token
      const refreshed = await refreshTwitterToken(credentials.refresh_token);

      if ("error" in refreshed) {
        console.error("Failed to refresh Twitter token:", refreshed.error);
        return null;
      }

      // Update in database
      await queryMyNeutron(
        `UPDATE admin_twitter_credentials SET access_token = $1, refresh_token = $2, expires_at = $3, updated_at = NOW() WHERE id = (SELECT id FROM admin_twitter_credentials LIMIT 1)`,
        [refreshed.accessToken, refreshed.refreshToken || credentials.refresh_token, refreshed.expiresAt]
      );

      return {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || credentials.refresh_token,
      };
    }

    return {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token,
    };
  } catch (error) {
    console.error("Error getting Twitter credentials:", error);
    return null;
  }
}

// Refresh Twitter access token
async function refreshTwitterToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt: number } | { error: string }> {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID!;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!;

    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error_description || "Failed to refresh token" };
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    return { error: "Failed to refresh token" };
  }
}

// Save Twitter/X credentials
export async function saveTwitterCredentials(
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await queryMyNeutron(`
      CREATE TABLE IF NOT EXISTS admin_twitter_credentials (
        id SERIAL PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Delete existing and insert new (only one set of credentials)
    await queryMyNeutron(`DELETE FROM admin_twitter_credentials`);

    await queryMyNeutron(
      `INSERT INTO admin_twitter_credentials (access_token, refresh_token, expires_at)
       VALUES ($1, $2, $3)`,
      [accessToken, refreshToken, expiresAt]
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving Twitter credentials:", error);
    return { success: false, error: "Failed to save credentials" };
  }
}
