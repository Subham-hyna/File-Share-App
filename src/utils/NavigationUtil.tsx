import {
  createNavigationContainerRef,
  CommonActions,
  StackActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export async function navigate(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
      navigationRef.dispatch(CommonActions.navigate(routeName, params));
  } else {
      console.warn('Navigation not ready, cannot navigate to:', routeName);
  }
}

export async function replace(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(routeName, params));
  } else {
      console.warn('Navigation not ready, cannot replace with:', routeName);
  }
}

export async function resetAndNavigate(routeName: string) {
  if (navigationRef.isReady()) {
      navigationRef.dispatch(
          CommonActions.reset({
              index: 0,
              routes: [{ name: routeName }],
          }),
      );
  } else {
      console.warn('Navigation not ready, cannot reset and navigate to:', routeName);
  }
}

export async function goBack() {
  if (navigationRef.isReady()) {
      navigationRef.dispatch(CommonActions.goBack());
  } else {
      console.warn('Navigation not ready, cannot go back');
  }
}

export async function push(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(routeName, params));
  } else {
      console.warn('Navigation not ready, cannot push:', routeName);
  }
}

export async function prepareNavigation() {
  navigationRef.isReady();
}