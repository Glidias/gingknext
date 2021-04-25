## Getting Started

A collaborative [Gingko](https://gingkoapp.com) Doc Viewer currently built with [React](https://reactjs.org), React Hooks, [Next.JS](https://nextjs.org) and [RoomService](https://www.roomservice.dev/).

See `env.example` on what to set up for environment variables.

Go to https://app.roomservice.dev/ to set up your Roomservice API key.

### Frontend viewer

Currently, the frontend look and feel intends to match Gingko v2 (aka. Gingkowriter?) at https://gingkowriter.com (Github source: https://github.com/gingko/client). But the Doc viewer is meant to view any stable/legacy (v1) publicly viewable `https://ginkoapp.com/{treeid}` documents which you (or others) must manually publish via the Tree Settings menu in the Gingko App.

### Future consideration roadmap (private account viewing/editing):

For private viewing/editing (ie. a full featured client) of your own online Gingko account documents via the currently available [Gingko REST API](https://gingkoapp.com/api-docs), since the API requires entering your Gingko account password somewhere 'secure' (eg. like the `.env` file), support for this is under future consideration at the moment, since the only "fairly safe" use case for such a setup would be only for local computer deployment (or local desktop app), or your own online server for specific personal/end-user audiences and tied primarily to one account). Alternatively, maybe the devs at Gingko can come up with an application token/api key service for the REST API to work. Or, someone can do up a completely new backend exclusively for GingkNext-only documents editing?

______

### Development

On your local computer, you can run the development server:

```bash
npm run dev
# or
yarn dev
```

and open [http://localhost:3000](http://localhost:3000) with your browser to see the result.