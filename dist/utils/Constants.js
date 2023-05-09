"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERRORS = exports.SUCCESS = exports.ROLES = exports.SUPER_ADMIN = exports.USER = exports.ADMIN = void 0;
exports.ADMIN = "admin";
exports.USER = "user";
exports.SUPER_ADMIN = "superadmin";
exports.ROLES = [exports.ADMIN, exports.USER, exports.SUPER_ADMIN];
exports.SUCCESS = {
    USER_ADDED: "User added successfully",
    USER_DELETED: "User deleted successfully",
    USER_UPDATED: "User updated successfully",
    ADMIN_ADDED: "Admin added successfully",
    ADMIN_DELETED: "Admin deleted successfully",
    ADMIN_UPDATED: "Admin updated successfully",
    ADMIN_DATA_UPDATED: "Admin data updated successfully",
    EMAIL_SENT: "Email sent successfully",
};
exports.ERRORS = {
    UNAUTHORIZED: "Unauthorized",
    USER_NOT_FOUND: "User not found",
    USER_ALREADY_EXISTS: "User already exists",
    USER_NOT_ADDED: "User not added",
    USER_NOT_DELETED: "User not deleted",
    USER_NOT_UPDATED: "User not updated",
    ADMIN_NOT_FOUND: "Admin not found",
    ADMIN_ALREADY_EXISTS: "Admin already exists",
    ADMIN_NOT_ADDED: "Admin not added",
    ADMIN_NOT_DELETED: "Admin not deleted",
    ADMIN_NOT_UPDATED: "Admin not updated",
    ADMIN_DATA_NOT_UPDATED: "Admin data not updated",
};
