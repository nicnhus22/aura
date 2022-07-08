function serializeGame(rawGame) {
  /**
   * Serialises a raw game object into a proper Game object.
   */
   return {
    publisherId: rawGame.publisher_id, 
    name: rawGame.name, 
    platform: rawGame.os, 
    storeId: rawGame.app_id, 
    bundleId: rawGame.bundle_id, 
    appVersion: rawGame.version, 
    isPublished: true,
  }
}

module.exports = serializeGame;