'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'

export default function SystemArchitecturePage() {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))

  const handleDownload = () => {
    const svg = document.querySelector('#dfd-diagram') as SVGElement
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 1600
    canvas.height = 1200

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = 'HireRankerAI-DFD.png'
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            HireRankerAI System Architecture
          </h1>
          <p className="text-muted-foreground text-lg">
            Data Flow Diagram (DFD) - Level 1
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">System Overview</h2>
              <p className="text-sm text-muted-foreground">
                Complete data flow architecture showing entities, processes, data stores, and information flows
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleZoomOut} variant="outline" size="icon">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button onClick={handleZoomIn} variant="outline" size="icon">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </div>

          <div className="overflow-auto border rounded-lg bg-white p-8">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', transition: 'transform 0.2s' }}>
              <svg
                id="dfd-diagram"
                width="1600"
                height="1200"
                viewBox="0 0 1600 1200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#334155" />
                  </marker>
                  
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="2" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* External Entities */}
                <g id="applicant-entity">
                  <rect x="50" y="150" width="180" height="80" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" filter="url(#shadow)" />
                  <text x="140" y="195" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#78350f">Applicant</text>
                </g>

                <g id="hr-manager-entity">
                  <rect x="1370" y="150" width="180" height="80" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" filter="url(#shadow)" />
                  <text x="1460" y="195" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#78350f">HR Manager</text>
                </g>

                <g id="admin-entity">
                  <rect x="1370" y="450" width="180" height="80" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" filter="url(#shadow)" />
                  <text x="1460" y="495" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#78350f">Admin</text>
                </g>

                <g id="system-entity">
                  <rect x="50" y="900" width="180" height="80" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" filter="url(#shadow)" />
                  <text x="140" y="945" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#78350f">AI System</text>
                </g>

                {/* Process 1: Application Processing */}
                <g id="process-1">
                  <rect x="450" y="100" width="280" height="180" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" filter="url(#shadow)" />
                  <circle cx="480" cy="130" r="18" fill="#f59e0b" />
                  <text x="480" y="137" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">1</text>
                  <text x="590" y="170" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Application</text>
                  <text x="590" y="195" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Processing &</text>
                  <text x="590" y="220" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Extraction System</text>
                </g>

                {/* Process 2: Ranking & Scoring */}
                <g id="process-2">
                  <rect x="450" y="380" width="280" height="180" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" filter="url(#shadow)" />
                  <circle cx="480" cy="410" r="18" fill="#f59e0b" />
                  <text x="480" y="417" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">2</text>
                  <text x="590" y="450" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Ranking &</text>
                  <text x="590" y="475" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Scoring</text>
                  <text x="590" y="500" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">System</text>
                </g>

                {/* Process 3: Interview Management */}
                <g id="process-3">
                  <rect x="950" y="380" width="280" height="180" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" filter="url(#shadow)" />
                  <circle cx="980" cy="410" r="18" fill="#f59e0b" />
                  <text x="980" y="417" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">3</text>
                  <text x="1090" y="450" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Interview</text>
                  <text x="1090" y="475" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Management</text>
                  <text x="1090" y="500" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">System</text>
                </g>

                {/* Process 4: Video Session System */}
                <g id="process-4">
                  <rect x="450" y="750" width="280" height="180" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" filter="url(#shadow)" />
                  <circle cx="480" cy="780" r="18" fill="#f59e0b" />
                  <text x="480" y="787" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">4</text>
                  <text x="590" y="820" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Video Session</text>
                  <text x="590" y="845" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">& Interview</text>
                  <text x="590" y="870" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Recording System</text>
                </g>

                {/* Process 5: Notification System */}
                <g id="process-5">
                  <rect x="950" y="750" width="280" height="180" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" filter="url(#shadow)" />
                  <circle cx="980" cy="780" r="18" fill="#f59e0b" />
                  <text x="980" y="787" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">5</text>
                  <text x="1090" y="820" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Notification &</text>
                  <text x="1090" y="845" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">Email</text>
                  <text x="1090" y="870" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#78350f">System</text>
                </g>

                {/* Data Stores */}
                <g id="ds-applications">
                  <rect x="250" y="340" width="40" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  <rect x="290" y="340" width="140" height="60" fill="#fef3c7" stroke="#475569" strokeWidth="2" />
                  <text x="360" y="365" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">Applications</text>
                  <text x="270" y="375" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">D1</text>
                </g>

                <g id="ds-rankings">
                  <rect x="810" y="340" width="40" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  <rect x="850" y="340" width="140" height="60" fill="#fef3c7" stroke="#475569" strokeWidth="2" />
                  <text x="920" y="365" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">Rankings</text>
                  <text x="830" y="375" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">D2</text>
                </g>

                <g id="ds-users">
                  <rect x="1310" y="290" width="40" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  <rect x="1350" y="290" width="140" height="60" fill="#fef3c7" stroke="#475569" strokeWidth="2" />
                  <text x="1420" y="315" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">Users</text>
                  <text x="1330" y="325" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">D3</text>
                </g>

                <g id="ds-video-sessions">
                  <rect x="250" y="710" width="40" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  <rect x="290" y="710" width="140" height="60" fill="#fef3c7" stroke="#475569" strokeWidth="2" />
                  <text x="360" y="728" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">Video</text>
                  <text x="360" y="745" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">Sessions</text>
                  <text x="270" y="745" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">D4</text>
                </g>

                <g id="ds-notifications">
                  <rect x="1310" y="710" width="40" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  <rect x="1350" y="710" width="140" height="60" fill="#fef3c7" stroke="#475569" strokeWidth="2" />
                  <text x="1420" y="735" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">Notifications</text>
                  <text x="1330" y="745" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">D5</text>
                </g>

                <g id="ds-analytics">
                  <rect x="1310" y="600" width="40" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  <rect x="1350" y="600" width="140" height="60" fill="#fef3c7" stroke="#475569" strokeWidth="2" />
                  <text x="1420" y="625" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350f">Analytics</text>
                  <text x="1330" y="635" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">D6</text>
                </g>

                {/* Data Flows */}
                
                {/* Applicant to Process 1 */}
                <line x1="230" y1="190" x2="450" y2="190" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="340" y="175" fontSize="12" fill="#334155">resume & documents</text>

                {/* Process 1 to Applications */}
                <line x1="450" y1="250" x2="360" y2="340" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="380" y="285" fontSize="12" fill="#334155">extracted data</text>

                {/* Applications to Process 1 */}
                <line x1="360" y1="340" x2="480" y2="280" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="390" y="320" fontSize="12" fill="#334155">application info</text>

                {/* Process 1 to Process 2 */}
                <line x1="590" y1="280" x2="590" y2="380" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="600" y="335" fontSize="12" fill="#334155">applicant data</text>

                {/* Process 2 to Rankings */}
                <line x1="730" y1="430" x2="850" y2="370" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="760" y="390" fontSize="12" fill="#334155">ranking scores</text>

                {/* Rankings to Process 2 */}
                <line x1="850" y1="390" x2="730" y2="450" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="760" y="430" fontSize="12" fill="#334155">ranking criteria</text>

                {/* Rankings to Process 3 */}
                <line x1="990" y1="370" x2="990" y2="380" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="920" y="365" fontSize="12" fill="#334155">top candidates</text>

                {/* Process 3 to Notifications */}
                <line x1="1230" y1="520" x2="1380" y2="710" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1250" y="615" fontSize="12" fill="#334155">interview invites</text>

                {/* Process 3 to HR Manager */}
                <line x1="1230" y1="420" x2="1370" y2="220" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1250" y="315" fontSize="12" fill="#334155">candidate list</text>

                {/* HR Manager to Process 3 */}
                <line x1="1370" y1="240" x2="1230" y2="440" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1250" y="345" fontSize="12" fill="#334155">schedule interviews</text>

                {/* Process 3 to Users */}
                <line x1="1230" y1="390" x2="1350" y2="330" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1250" y="365" fontSize="12" fill="#334155">user data</text>

                {/* HR Manager to Admin */}
                <line x1="1460" y1="230" x2="1460" y2="450" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1475" y="345" fontSize="12" fill="#334155">access requests</text>

                {/* Admin to Analytics */}
                <line x1="1420" y1="530" x2="1420" y2="600" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1435" y="570" fontSize="12" fill="#334155">view reports</text>

                {/* Process 2 to Analytics */}
                <line x1="730" y1="510" x2="1310" y2="620" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="900" y="560" fontSize="12" fill="#334155">scoring analytics</text>

                {/* Applicant to Process 4 */}
                <line x1="140" y1="230" x2="140" y2="840" stroke="#334155" strokeWidth="2" />
                <line x1="140" y1="840" x2="450" y2="840" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="250" y="825" fontSize="12" fill="#334155">join video interview</text>

                {/* Process 4 to Video Sessions */}
                <line x1="450" y1="820" x2="430" y2="740" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="360" y="775" fontSize="12" fill="#334155">session data</text>

                {/* Video Sessions to Process 4 */}
                <line x1="430" y1="750" x2="470" y2="830" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="390" y="795" fontSize="12" fill="#334155">recordings</text>

                {/* AI System to Process 4 */}
                <line x1="230" y1="940" x2="450" y2="880" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="270" y="905" fontSize="12" fill="#334155">transcription</text>

                {/* Process 4 to Process 5 */}
                <line x1="730" y1="840" x2="950" y2="840" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="810" y="825" fontSize="12" fill="#334155">interview results</text>

                {/* Process 5 to Notifications */}
                <line x1="1230" y1="800" x2="1350" y2="740" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1250" y="775" fontSize="12" fill="#334155">email/SMS</text>

                {/* Notifications to Process 5 */}
                <line x1="1350" y1="760" x2="1230" y2="820" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="1250" y="795" fontSize="12" fill="#334155">notification logs</text>

                {/* Process 5 to Applicant */}
                <line x1="950" y1="840" x2="230" y2="200" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="500" y="480" fontSize="12" fill="#334155">status updates</text>

                {/* Applications to Process 2 */}
                <line x1="360" y1="400" x2="450" y2="450" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="380" y="430" fontSize="12" fill="#334155">app records</text>

                {/* Process 3 to Video Sessions */}
                <line x1="950" y1="560" x2="430" y2="710" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="650" y="630" fontSize="12" fill="#334155">schedule session</text>

                {/* Legend */}
                <g id="legend" transform="translate(50, 1050)">
                  <text x="0" y="0" fontSize="18" fontWeight="bold" fill="#334155">Legend:</text>
                  
                  <rect x="0" y="15" width="80" height="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                  <text x="90" y="40" fontSize="14" fill="#334155">External Entity</text>
                  
                  <rect x="250" y="15" width="80" height="40" rx="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                  <text x="340" y="40" fontSize="14" fill="#334155">Process</text>
                  
                  <rect x="470" y="20" width="20" height="30" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  <rect x="490" y="20" width="60" height="30" fill="#fef3c7" stroke="#475569" strokeWidth="2" />
                  <text x="560" y="40" fontSize="14" fill="#334155">Data Store</text>
                  
                  <line x1="710" y1="35" x2="770" y2="35" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <text x="780" y="40" fontSize="14" fill="#334155">Data Flow</text>
                </g>
              </svg>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">External Entities</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold">Applicant:</span> Job candidates submitting applications</li>
              <li><span className="font-semibold">HR Manager:</span> Recruiters managing hiring process</li>
              <li><span className="font-semibold">Admin:</span> System administrators</li>
              <li><span className="font-semibold">AI System:</span> Automated processing (OCR, scoring, transcription)</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Core Processes</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold">P1:</span> Application Processing & Extraction</li>
              <li><span className="font-semibold">P2:</span> Ranking & Scoring System</li>
              <li><span className="font-semibold">P3:</span> Interview Management</li>
              <li><span className="font-semibold">P4:</span> Video Session & Recording</li>
              <li><span className="font-semibold">P5:</span> Notification & Email System</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Data Stores</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold">D1 Applications:</span> Candidate application data</li>
              <li><span className="font-semibold">D2 Rankings:</span> Scoring and ranking results</li>
              <li><span className="font-semibold">D3 Users:</span> User accounts and profiles</li>
              <li><span className="font-semibold">D4 Video Sessions:</span> Interview recordings and metadata</li>
              <li><span className="font-semibold">D5 Notifications:</span> Email and SMS notifications</li>
              <li><span className="font-semibold">D6 Analytics:</span> System analytics and reports</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Automated resume parsing and data extraction</li>
              <li>✓ AI-powered candidate ranking and scoring</li>
              <li>✓ Integrated video interview system</li>
              <li>✓ Real-time notifications via email/SMS</li>
              <li>✓ Comprehensive analytics dashboard</li>
              <li>✓ Secure user authentication and RLS policies</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
