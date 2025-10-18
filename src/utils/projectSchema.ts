import Joi from 'joi'
import { SanitizedProject } from './sanitizeProjectData'

export type CreateProjectPayload = Pick<SanitizedProject, 'assets' | 'width' | 'height'>
export type UpdateProjectPayload = Partial<CreateProjectPayload>

export const createProjectSchema = Joi.object<CreateProjectPayload>({
  width: Joi.number().integer().min(1).max(3000).required(),
  height: Joi.number().integer().min(1).max(3000).required(),
  assets: Joi.array().items({}).optional(),
})

export const updateProjectSchema = Joi.object<UpdateProjectPayload>({
  width: Joi.number().integer().min(1).max(3000).optional(),
  height: Joi.number().integer().min(1).max(3000).optional(),
  assets: Joi.array().items(Joi.any()).optional(),
})
