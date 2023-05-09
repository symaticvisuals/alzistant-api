
import apiRouter from './api'

const routes = [{ prefix: '/api', app: apiRouter }] as const;

export default routes;