Mobile Architecture (React Native)
Description:
The mobile app structure is similar to the web front-end but uses React Native components, React Navigation for navigation, and may share a common Redux store structure.

         +--------------------------------------+
         |             React Native              |
         |--------------------------------------|
         |    Screens           |   Components   |
         | (HomeScreen, etc.)   | (MapView, etc.)|
         +----------+-----------+-------+--------+
                    |                   |
               (props/state)            |
                    v                   v
               +----------+        +-----------+
               |  Redux   |        |  Async    |
               |  Store   |        |  Storage  |
               +----------+        +-----+-----+
                        | (dispatch actions) 
                        v
                     +-------+
                     | Axios |
                     | (HTTP)|
                     +---+---+
                         |
                      (API calls)
                         |
                         v
                   +-----------+
                   |  Backend  |
                   |  API      |
                   +-----------+
Explanation:

Screens: Equivalent to pages in the web app, handle layout and render components.
Components: Reusable UI elements.
Redux Store: Holds global app state.
Async Storage (or Secure Storage): For persisting session tokens or small pieces of state locally.
Axios: To fetch data from the backend similarly to the web frontend.
