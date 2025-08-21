const OAuth2Strategy = require('passport-oauth2').Strategy;
const axios = require('axios');

/**
 * Bitrix24 OAuth2 Strategy для Passport
 */
class Bitrix24Strategy extends OAuth2Strategy {
  constructor(options, verify) {
    super({
      authorizationURL: 'https://oauth.bitrix.info/oauth/authorize/',
      tokenURL: 'https://oauth.bitrix.info/oauth/token/',
      clientID: options.clientID,
      clientSecret: options.clientSecret,
      callbackURL: options.callbackURL,
      scope: options.scope || ['crm', 'task', 'user', 'im'],
      state: true
    }, verify);

    this.name = 'bitrix24';
    this._options = options;
  }

  /**
   * Получение профиля пользователя
   */
  async userProfile(accessToken, done) {
    try {
      // Получаем информацию о пользователе
      const userResponse = await axios.get('https://oauth.bitrix.info/rest/user.current', {
        params: {
          auth: accessToken
        }
      });

      const user = userResponse.data.result;

      // Получаем информацию о портале
      const portalResponse = await axios.get('https://oauth.bitrix.info/rest/app.info', {
        params: {
          auth: accessToken
        }
      });

      const portal = portalResponse.data.result;

      const profile = {
        id: user.ID,
        displayName: `${user.NAME} ${user.LAST_NAME}`,
        name: {
          familyName: user.LAST_NAME,
          givenName: user.NAME
        },
        emails: [{
          value: user.EMAIL,
          type: 'work'
        }],
        photos: [{
          value: user.PERSONAL_PHOTO || null
        }],
        portal: portal.DOMAIN,
        accessToken: accessToken,
        permissions: this._options.scope
      };

      return done(null, profile);
    } catch (error) {
      return done(error);
    }
  }

  /**
   * Авторизация
   */
  authenticate(req, options) {
    // Добавляем параметры для Bitrix24
    const authOptions = {
      ...options,
      client_id: this._options.clientID,
      response_type: 'code',
      scope: this._options.scope.join(' ')
    };

    super.authenticate(req, authOptions);
  }
}

module.exports = Bitrix24Strategy;
