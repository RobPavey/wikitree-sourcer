//
//  AppDelegate.swift
//  macOS (App)
//
//  Created by Robert Pavey on 10/6/21.
//

import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Override point for customization after application launch.
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

}
