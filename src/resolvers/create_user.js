import { ERRORS, ENVIRONMENT } from '../constant.js'
import DISK from '../disk.js'
import bcrypt from 'bcryptjs'
import { GraphQLError } from 'graphql/index.mjs'
import MAIL from '../mail.js'
import { v4 as uuid4 } from 'uuid'

export default async ({ mail, pwd }) => {
  if (!ENVIRONMENT.ALLOW_REGISTRATION)
    throw new GraphQLError(ERRORS.REGISTRATION_DISABLED)

  if (!mail.match(ENVIRONMENT.MAIL_REGEX))
    throw new GraphQLError(ERRORS.MAIL_INVALID)

  if (!pwd.match(ENVIRONMENT.PWD_REGEX))
    throw new GraphQLError(ERRORS.PASSWORD_INVALID)

  const user_exist = await DISK.User({
    type : DISK.EXIST,
    match: { mail },
  })

  if (user_exist) throw new GraphQLError(ERRORS.MAIL_USED)

  const uuid = uuid4()
  const verification_code = [...new Array(64)]
      .map(() => (~~(Math.random() * 36)).toString(36))
      .join('')

  await MAIL.send([MAIL.ACCOUNT_CREATE, uuid, mail, verification_code])
  await DISK.User({
    type  : DISK.CREATE,
    fields: {
      uuid,
      mail,
      verification_code,
      hash                       : pwd ? await bcrypt.hash(pwd, 10) : undefined,
      verified                   : false,
      sessions                   : [],
      last_reset_code_sent       : 0,
      last_verification_code_sent: Date.now(),
    },
  })
  return true
}
