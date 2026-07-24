const users = new Map();

/**
 * Guest CEO Rumuz & Profil Üretimi
 */
export function createGuestProfile() {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const username = `Misafir_CEO_${randomId}`;
  const userId = `guest_${Date.now()}_${randomId}`;

  const profile = {
    id: userId,
    username,
    email: null,
    isGuest: true,
    stats: {
      wins: 0,
      totalEarnings: 0,
      rankTitle: "Stajyer CEO",
      matchHistory: []
    },
    createdAt: Date.now()
  };

  users.set(userId, profile);
  return profile;
}

/**
 * Kayıtlı Hesap Oluşturma veya Misafirden Hesaba Dönüştürme
 */
export function registerAccount({ email, password, username, guestId }) {
  if (!email || !password || !username) {
    return { success: false, error: "E-posta, şifre ve kullanıcı adı gereklidir." };
  }

  const existingEmail = Array.from(users.values()).find(u => u.email === email.toLowerCase());
  if (existingEmail) {
    return { success: false, error: "Bu e-posta adresi zaten kayıtlı!" };
  }

  let profile = null;

  if (guestId && users.has(guestId)) {
    profile = users.get(guestId);
    profile.email = email.toLowerCase();
    profile.password = password; // In prod: bcrypt hash
    profile.username = username;
    profile.isGuest = false;
    profile.stats.rankTitle = "Holding Patronu";
  } else {
    const userId = `user_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    profile = {
      id: userId,
      username,
      email: email.toLowerCase(),
      password,
      isGuest: false,
      stats: {
        wins: 0,
        totalEarnings: 0,
        rankTitle: "Holding Patronu",
        matchHistory: []
      },
      createdAt: Date.now()
    };
    users.set(userId, profile);
  }

  return { success: true, profile };
}

/**
 * Kullanıcı Girişi (E-Posta / Şifre)
 */
export function loginAccount({ email, password }) {
  if (!email || !password) {
    return { success: false, error: "E-posta ve şifre gereklidir." };
  }

  const user = Array.from(users.values()).find(u => u.email === email.toLowerCase());
  if (!user || user.password !== password) {
    return { success: false, error: "Hatalı e-posta veya şifre!" };
  }

  return { success: true, profile: user };
}

/**
 * Kullanıcı Profili Getir
 */
export function getUserProfile(userId) {
  return users.get(userId) || null;
}
