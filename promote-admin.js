/**
 * ADMIN PROMOTION SCRIPT
 * This script helps you promote a user to ADMIN role during initial setup.
 * 
 * USAGE:
 * 1. Register a user via POST /api/v1/auth/register
 * 2. Login via POST /api/v1/auth/login to get JWT token
 * 3. Use this script or call the endpoint manually
 * 
 * SECURITY:
 * - Set ADMIN_SETUP_SECRET in your .env file
 * - Remove this endpoint after creating your first admin
 */

const API_BASE_URL = 'http://localhost:3000/api/v1';
const ADMIN_SECRET = process.env.ADMIN_SETUP_SECRET || 'CHANGE_ME_IN_PRODUCTION';

/**
 * Promote a user to ADMIN
 * @param {string} email - User's email address
 * @param {string} jwtToken - Valid JWT token (from login)
 */
async function promoteUserToAdmin(email, jwtToken) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(email)}/promote-to-admin`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          adminSecret: ADMIN_SECRET,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to promote user:', data);
      process.exit(1);
    }

    console.log('✅ Success!');
    console.log('📧 Email:', data.user.email);
    console.log('👤 Name:', `${data.user.firstName} ${data.user.lastName}`);
    console.log('🎖️  Role:', data.user.role);
    console.log('\n⚠️  IMPORTANT: Remove the promote-to-admin endpoint from production!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Command-line usage
if (require.main === module) {
  const email = process.argv[2];
  const jwtToken = process.argv[3];

  if (!email || !jwtToken) {
    console.log('Usage: node promote-admin.js <email> <jwt-token>');
    console.log('Example: node promote-admin.js admin@clinic.com eyJhbGc...');
    process.exit(1);
  }

  promoteUserToAdmin(email, jwtToken);
}

module.exports = { promoteUserToAdmin };
