import launchEditor from 'react-dev-utils/launchEditor';
import { route } from '..';

export default route(async function () {
  launchEditor(
    '/' + this.req.query.file,
    parseInt(this.req.query.line as string, 10),
    parseInt(this.req.query.col as string, 10),
  );
});
