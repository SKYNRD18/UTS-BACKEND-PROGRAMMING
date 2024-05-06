const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

async function getUsers(request, response, next) {
  try {
    const { page_number = 1, page_size = 10, search } = request.query;
    let users;
    let count;
    let total_pages;
    let has_previous_page;
    let has_next_page;

    if (search) {
      const filteredUsers = await usersService.getUsersByName(
        search,
        page_number,
        page_size
      );
      users = filteredUsers.users;
      count = filteredUsers.count;
      total_pages = filteredUsers.total_pages;
      has_previous_page = filteredUsers.has_previous_page;
      has_next_page = filteredUsers.has_next_page;
    } else {
      const result = await usersService.getFilteredUsers(
        page_number,
        page_size
      );
      count = result.count;
      total_pages = result.total_pages;
      has_previous_page = result.has_previous_page;
      has_next_page = result.has_next_page;
      users = result.users;
    }

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    return response.status(200).json({
      page_number: parseInt(page_number),
      page_size: parseInt(page_size),
      count: formattedUsers.length,
      total_pages,
      has_previous_page,
      has_next_page,
      users: formattedUsers,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

async function createUser(request, response, next) {
  try {
    const { name, email, password, password_confirm } = request.body;

    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    if (await usersService.emailIsRegistered(email)) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

async function updateUser(request, response, next) {
  try {
    const { id } = request.params;
    const { name, email } = request.body;
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(request, response, next) {
  try {
    const { id } = request.params;
    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(request, response, next) {
  try {
    const { id } = request.params;
    const { oldPassword, newPassword, confirmPassword } = request.body;

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        statusCode: 400,
        error: 'PASSWORD_MISMATCH',
        message: 'New password and confirm password do not match',
      });
    }

    if (newPassword.length < 6 || newPassword.length > 32) {
      return response.status(400).json({
        statusCode: 400,
        error: 'INVALID_PASSWORD_LENGTH',
        message: 'New password must be between 6 and 32 characters',
      });
    }

    const user = await usersService.getUser(id);
    if (!user) {
      return response.status(404).json({
        statusCode: 404,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const success = await usersService.changeUserPassword(
      id,
      oldPassword,
      newPassword
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update password'
      );
    }

    return response
      .status(200)
      .json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
