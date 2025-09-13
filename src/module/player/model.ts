import { t } from 'elysia'

export namespace PlayerModel {
    export const Player = t.Object({
      firstName: t.String(),
      lastName: t.String(),
      weight: t.Number(),
      height: t.Number(),
      hairColor: t.String(),
      eyesColor: t.String(),
      hairStyle: t.String(),
      skinColor: t.String(),
      sex: t.String(),
      birthDate: t.String(),
      jobId: t.Number(),
      cash: t.Number(),
      bank: t.Number(),
    })
}