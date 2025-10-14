import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, isHost } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const jitsiApiKey = "vpaas-magic-cookie-393c80097c644f049995136e9fd279d3"
    const roomName = `interview-meeting-${meetingId}`

    // Jitsi as a Service URL format
    const jitsiDomain = "8x8.vc"
    const configParams = new URLSearchParams({
      // Hide Jitsi's own header and branding
      "config.toolbarButtons": JSON.stringify([
        "microphone",
        "camera",
        "closedcaptions",
        "desktop",
        "fullscreen",
        "fodeviceselection",
        "hangup",
        "profile",
        "chat",
        "recording",
        "livestreaming",
        "etherpad",
        "sharedvideo",
        "settings",
        "raisehand",
        "videoquality",
        "filmstrip",
        "invite",
        "feedback",
        "stats",
        "shortcuts",
        "tileview",
        "videobackgroundblur",
        "download",
        "help",
        "mute-everyone",
      ]),
      "config.hideDisplayName": "false",
      "config.subject": `Interview Meeting ${meetingId}`,
      "config.defaultLanguage": "en",
      "config.enableWelcomePage": "false",
      "config.prejoinPageEnabled": "false",
      "config.disableDeepLinking": "true",
      "interfaceConfig.SHOW_JITSI_WATERMARK": "false",
      "interfaceConfig.SHOW_WATERMARK_FOR_GUESTS": "false",
      "interfaceConfig.SHOW_BRAND_WATERMARK": "false",
      "interfaceConfig.BRAND_WATERMARK_LINK": "",
      "interfaceConfig.SHOW_POWERED_BY": "false",
      "interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT": "false",
      "interfaceConfig.DISPLAY_WELCOME_FOOTER": "false",
      "interfaceConfig.SHOW_PROMOTIONAL_CLOSE_PAGE": "false",
      "interfaceConfig.LANG_DETECTION": "false",
      "interfaceConfig.INVITATION_POWERED_BY": "false",
    })

    const roomUrl = `https://${jitsiDomain}/${jitsiApiKey}/${roomName}?${configParams.toString()}`

    return NextResponse.json({
      success: true,
      roomUrl,
      roomName,
      isHost,
      meetingId,
    })
  } catch (error) {
    console.error("Error creating Jitsi room:", error)
    return NextResponse.json({ error: "Failed to create Jitsi room" }, { status: 500 })
  }
}
