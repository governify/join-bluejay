"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import YAML from "yamljs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { AlertCircle, Download, Upload, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const InfoYmlWizard = () => {
  const [infoJson, setInfoJson] = useState({
    name: "",
    owner: "",
    teamId: "",
    identities: {},
    notifications: {},
    members: {},
  })

  const [selectsOptions, setSelectsOptions] = useState({
    identities: ["pivotal", "heroku"],
    notifications: ["slack"],
  })

  const [ymlText, setYmlText] = useState("")
  const [primarySelect, setPrimarySelect] = useState("identities")
  const [secondarySelect, setSecondarySelect] = useState("")
  const [fieldValue, setFieldValue] = useState("")
  const [isCrypted, setIsCrypted] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberSurname, setNewMemberSurname] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [downloadErrors, setDownloadErrors] = useState([])

  useEffect(() => {
    generateYml()
    loadSecondaryOptions(primarySelect)
  }, [primarySelect]) // Removed unnecessary dependency: infoJson

  const generateYml = () => {
    const yml = YAML.stringify({ project: infoJson }, 5, 2)
    setYmlText(yml.replace(/\n/g, "\r\n"))
  }

  const loadSecondaryOptions = (primary) => {
    setSecondarySelect(selectsOptions[primary]?.[0] || "")
  }

  const handleAddMember = () => {
    if (checkNewMember(newMemberName, newMemberSurname)) {
      const memberTag = `member${Object.keys(infoJson.members).length + 1}`
      setInfoJson((prev) => ({
        ...prev,
        members: {
          ...prev.members,
          [memberTag]: { name: newMemberName, surname: newMemberSurname },
        },
      }))
      setNewMemberName("")
      setNewMemberSurname("")
    }
  }

  const handleAddField = async () => {
    let value = fieldValue
    if (isCrypted) {
      value = await encrypt(fieldValue)
    }

    if (primarySelect.includes("Members")) {
      const memberKey = primarySelect.replace("Members > ", "")
      setInfoJson((prev) => ({
        ...prev,
        members: {
          ...prev.members,
          [memberKey]: {
            ...prev.members[memberKey],
            [secondarySelect]: value,
          },
        },
      }))
    } else {
      setInfoJson((prev) => ({
        ...prev,
        [primarySelect]: {
          ...prev[primarySelect],
          [secondarySelect]: value,
        },
      }))
    }
    setFieldValue("")
  }

  const handleDownload = async () => {
    try {
      const res = await axios.post("https://scopes.bluejay.governify.io/api/v1/scopes/development/check", {
        name: "Wizard",
        data: ymlText,
      })
      const errors = res.data.projects[0].errors
      setDownloadErrors(errors)
      if (errors.length === 0) {
        download("info.yml", ymlText)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleLoadYml = async () => {
    try {
      const [, , , githubOwner, githubRepo] = githubUrl.split("/")
      const res = await axios.get("/getYml", { params: { githubOwner, githubRepo } })
      const nativeObject = YAML.parse(res.data)
      setInfoJson(nativeObject.project)
    } catch (error) {
      console.error(error)
    }
  }

  const checkNewMember = (name, surname) => {
    return name?.length > 3 && surname?.length > 3
  }

  const encrypt = async (text) => {
    try {
      const res = await axios.get("/encrypt", { params: { text } })
      return res.data
    } catch (error) {
      console.error(error)
      return text
    }
  }

  const download = (filename, text) => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
    element.setAttribute("download", filename)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-blue-500 text-white">
            <CardTitle className="text-2xl text-center">Info.yml Wizard</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name*</Label>
                      <Input
                        id="name"
                        placeholder="Project Name"
                        value={infoJson.name}
                        onChange={(e) => setInfoJson((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner*</Label>
                      <Input
                        id="owner"
                        placeholder="Project Owner"
                        value={infoJson.owner}
                        onChange={(e) => setInfoJson((prev) => ({ ...prev, owner: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamId">TeamId*</Label>
                      <Input
                        id="teamId"
                        placeholder="Team ID"
                        value={infoJson.teamId}
                        onChange={(e) => setInfoJson((prev) => ({ ...prev, teamId: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="identities">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="identities">Identities*</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="members">Members*</TabsTrigger>
                  </TabsList>
                  <TabsContent value="identities">
                    <Card className="bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Identities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.entries(infoJson.identities).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2 mb-2">
                            <Input value={key} readOnly className="w-1/3" />
                            <Input value={value} readOnly className="w-1/2" />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newIdentities = { ...infoJson.identities }
                                delete newIdentities[key]
                                setInfoJson((prev) => ({ ...prev, identities: newIdentities }))
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="notifications">
                    <Card className="bg-yellow-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Notifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.entries(infoJson.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2 mb-2">
                            <Input value={key} readOnly className="w-1/3" />
                            <Input value={value} readOnly className="w-1/2" />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newNotifications = { ...infoJson.notifications }
                                delete newNotifications[key]
                                setInfoJson((prev) => ({ ...prev, notifications: newNotifications }))
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="members">
                    <Card className="bg-purple-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Members (At least 1)*</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.entries(infoJson.members).map(([key, value]) => (
                          <div key={key} className="mb-4 p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{key}</h4>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newMembers = { ...infoJson.members }
                                  delete newMembers[key]
                                  setInfoJson((prev) => ({ ...prev, members: newMembers }))
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(value).map(([attrKey, attrValue]) => (
                                <div key={attrKey} className="flex items-center space-x-2">
                                  <span className="font-medium w-1/3">{attrKey}:</span>
                                  <Input value={attrValue} readOnly className="w-2/3" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Card className="bg-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Name"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                        />
                        <Input
                          placeholder="Surname"
                          value={newMemberSurname}
                          onChange={(e) => setNewMemberSurname(e.target.value)}
                        />
                        <Button onClick={handleAddMember}>
                          <Plus className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Select value={primarySelect} onValueChange={setPrimarySelect}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(selectsOptions).map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={secondarySelect} onValueChange={setSecondarySelect}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectsOptions[primarySelect]?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Value" value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} />
                        <div className="flex items-center space-x-2">
                          <Checkbox id="crypted" checked={isCrypted} onCheckedChange={setIsCrypted} />
                          <label htmlFor="crypted">Crypted</label>
                        </div>
                        <Button onClick={handleAddField}>Add Field</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>Fields marked with * are mandatory.</AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      "https://github.com/governifyauditor/goldenflow-showcase-project/blob/main/info.yml",
                      "_blank",
                    )
                  }
                >
                  Click here to see a minimal example
                </Button>
              </div>

              <div className="relative">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">YAML Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap max-w-full overflow-x-auto bg-gray-100 p-4 rounded-md">
                      {ymlText}
                    </pre>
                  </CardContent>
                </Card>
                <div className="absolute bottom-4 right-4 space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Load
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Load yml from GitHub</DialogTitle>
                      </DialogHeader>
                      <Input
                        placeholder="GitHub Repo URL"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                      />
                      <Button onClick={handleLoadYml}>Load yml</Button>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {downloadErrors.length > 0 && (
          <Dialog open={downloadErrors.length > 0} onOpenChange={() => setDownloadErrors([])}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Download Errors</DialogTitle>
              </DialogHeader>
              <ul>
                {downloadErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}

export default InfoYmlWizard

