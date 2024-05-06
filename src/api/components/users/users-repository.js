const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail by ID
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create a new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update an existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user by ID
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user detail by email
 * @param {string} email - User email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user's password
 * @param {string} id - User ID
 * @param {string} newPassword - Hashed new password
 * @returns {Promise}
 */
async function updatePassword(id, newPassword) {
  return User.findByIdAndUpdate(id, { password: newPassword });
}

/**
 * Get users by name with pagination
 * @param {string} name - User's name to search for
 * @param {number} page_number - Page number
 * @param {number} page_size - Page size
 * @returns {Promise}
 */
async function getUsersByName(name, page_number, page_size) {
  try {
    // Dapatkan daftar pengguna berdasarkan nama dari model User
    const users = await User.find({ name: { $regex: new RegExp(name, 'i') } });

    // Jika tidak ada pengguna yang ditemukan, kembalikan objek kosong
    if (!users || users.length === 0) {
      return {
        count: 0,
        total_pages: 0,
        has_previous_page: false,
        has_next_page: false,
        users: [],
      };
    }

    // Hitung jumlah pengguna dan halaman total sesuai kebutuhan
    const count = users.length;
    const total_pages = Math.ceil(count / page_size);
    const has_previous_page = page_number > 1;
    const has_next_page = page_number < total_pages;

    // Lakukan pengiriman data dalam format yang sesuai dengan paging
    const start_index = (page_number - 1) * page_size;
    const end_index = Math.min(start_index + page_size, count);
    const users_on_page = users.slice(start_index, end_index);

    return {
      count,
      total_pages,
      has_previous_page,
      has_next_page,
      users: users_on_page,
    };
  } catch (error) {
    console.error('Error getting users by name:', error);
    throw error;
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  updatePassword,
  getUsersByName,
};
