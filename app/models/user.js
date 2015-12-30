
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema
var CreateUpdatedAt = require('mongoose-timestamp');
var crypto = require('crypto');
var oAuthTypes = ['twitter', 'facebook', 'google'];
/**
 * User Schema
 */

var UserSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    unique: true,
    require: true,
    lowercase: true
  },
  avatar: String,
  provider: {
    type: String,
    default: 'local'
  },
  hashed_password: {
    type: String,
    require: true
  },
  salt: {
    type: String
  },
  reset_password_token: String,
  reset_password_expires: Date
})

UserSchema.plugin(CreateUpdatedAt)

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

// the below 5 validations only apply if you are signing up traditionally

UserSchema.path('name').validate(function (name) {
  if (this.doesNotRequireValidation()) return true
  return name.length
}, '姓名不能为空')

UserSchema.path('phone').validate(function (phone) {
  if (this.doesNotRequireValidation()) return true
  return phone.length
}, '手机号码不能为空')

UserSchema.path('phone').validate(function (phone, fn) {
  var User = mongoose.model('User')
  if (this.doesNotRequireValidation()) fn(true)

  // Check only when it is a new user or when phone field is modified
  if (this.isNew || this.isModified('phone')) {
    User.find({ phone: phone }).exec(function (err, users) {
      fn(!err && users.length === 0)
    })
  } else fn(true)
}, '手机号码已存在')

UserSchema.path('hashed_password').validate(function (hashed_password) {
  if (this.doesNotRequireValidation()) return true
  return hashed_password.length
}, '密码不能为空')


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.password)
    && oAuthTypes.indexOf(this.provider) === -1)
    next(new Error('Invalid password'))
  else
    next()
})

/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  },

  generateConfirmationToken: function(password) {
    if (!password) return '';
    var encrypred_confirm_code
    try {
      encrypred_confirm_code = crypto.createHmac('sha1',  this.salt).update(password).digest('hex')
      return encrypred_confirm_code
    } catch (err) {
      return ''
    }
  },

  roleAdmin: function() {
    var admin_level = 1

    return admin_level
  },

  /**
   * Validation is not required if using OAuth
   */

  doesNotRequireValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  }
}

module.exports = mongoose.model('User', UserSchema)
