import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

/// UIScene lifecycle entry point.
///
/// Apps built with the iOS 27 SDK must adopt the UIScene lifecycle or UIKit
/// traps at launch. React Native 0.88 ships scene-aware factory APIs; this
/// project is on 0.84, so the scene delegate drives the existing
/// window-based `startReactNative` API and forwards links to
/// `RCTLinkingManager` through its application-based entry points.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    let appDelegate = UIApplication.shared.delegate as? AppDelegate

    // AppDelegate normally creates the factory in didFinishLaunching; build
    // one here only if that did not happen.
    let delegate: ReactNativeDelegate
    let factory: RCTReactNativeFactory
    if let existingDelegate = appDelegate?.reactNativeDelegate,
       let existingFactory = appDelegate?.reactNativeFactory {
      delegate = existingDelegate
      factory = existingFactory
    } else {
      delegate = ReactNativeDelegate()
      delegate.dependencyProvider = RCTAppDependencyProvider()
      factory = RCTReactNativeFactory(delegate: delegate)
      appDelegate?.reactNativeDelegate = delegate
      appDelegate?.reactNativeFactory = factory
    }

    // React Native reads the cold-start URL from the bridge's launch options.
    // Under UIScene those arrive in the connection options instead, so fold
    // the first one back into launch options to keep Linking.getInitialURL()
    // working. Only a single scene is supported.
    var launchOptions = appDelegate?.launchOptions ?? [:]
    if let urlContext = connectionOptions.urlContexts.first {
      launchOptions[.url] = urlContext.url
    } else if let userActivity = connectionOptions.userActivities.first {
      launchOptions[.userActivityDictionary] = [
        UIApplication.LaunchOptionsKey.userActivityType.rawValue: userActivity.activityType,
        "UIApplicationLaunchOptionsUserActivityKey": userActivity,
      ]
    }

    let window = UIWindow(windowScene: windowScene)
    factory.startReactNative(
      withModuleName: "TheAtlanticReader",
      in: window,
      launchOptions: launchOptions
    )

    self.window = window
    appDelegate?.window = window
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    RCTLinkingManager.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }
}
