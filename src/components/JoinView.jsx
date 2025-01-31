"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import MoreInfo from "@/components/MoreInfo"
import config from "../config"
import DashboardBadge from './DashboardBadge';

const JoinView = () => {
  const [repoURL, setRepoURL] = useState("")
  const [result, setResult] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [generationResult, setGenerationResult] = useState("")
  const [verifiedRepoURL, setVerifiedRepoURL] = useState("")
  const [courses, setCourses] = useState([])
  const [courseMessage, setCourseMessage] = useState("hidden")
  const [userJoinCode, setUserJoinCode] = useState("")
  const [courseJoinCode, setCourseJoinCode] = useState("")
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  useEffect(() => {
    fetch(`${config.scopeUrl}/api/v1/scopes/development/courses`)
      .then((response) => response.json())
      .then((data) => {
        console.log("CONFIG OBJECT: ", JSON.stringify(config, null, 2))
        if (!data.scope) throw new Error("No courses found in response")
        setCourses(data.scope.filter((course) => !course.hidden))
      })
      .catch((error) => console.error("Error getting the courses:", error))
  }, [])

  const check = () => {
    resetGeneration()

    setResult("Checking...")
    const data = { repoList: [repoURL.trim()] }

    fetch(`${config.scopeUrl}/api/v1/scopes/development/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => showResult(data, repoURL))
      .catch((error) => {
        console.error("Error:", error)
        showResult(error)
      })
  }

  const showResult = (result, repoURL) => {
    if (result.code === 200 && result.projects.length === 1) {
      const err = result.projects[0].errors
      if (err.length === 0) {
        setResult("success")
        setVerifiedRepoURL(repoURL)
        setCourseMessage("block")
      } else {
        setResult("error")
      }
    } else {
      setResult("error")
      console.log("Unexpected result from checker:", JSON.stringify(result, null, 2))
    }
  }

  const generate = () => {
    if (courseCode === "" || verifiedRepoURL === "") return

    fetchCourseJoinCode(courseCode).then((fetchedJoinCode) => {
      if (fetchedJoinCode && userJoinCode !== fetchedJoinCode) {
        setGenerationResult("invalidJoinCode")
        return
      }

      setGenerationResult("Generating, please wait...")
      const data = { courseId: courseCode, repoList: [verifiedRepoURL] }

      fetch(`${config.scopeUrl}/api/v1/scopes/development/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => showGenerationResult(data, courseCode))
        .catch((error) => {
          console.error("Error:", error)
          showGenerationResult(error)
        })
    })
  }

  const showGenerationResult = (result, courseId) => {
    if (result.code === 200 && result.projects.length === 1) {
      const err = result.projects[0].errors;
      console.log("Result: ", JSON.stringify(result, null, 2));
      if (err) console.log(err);
      if (!err || err.length === 0) {
        const projectScope = result.projects[0].newScope;
        console.log('Register - Fetching course template id...');
        fetch(`${config.scopeUrl}/api/v1/scopes/development/${courseId}`)
          .then(response => response.json())
          .then(data => {
            const courseTemplateId = data.scope.templateId;
            console.log(`Register - Fetching TPA template ${courseTemplateId} ...`);
            fetch(`${config.registryUrl}/api/v6/templates/${courseTemplateId}`)
              .then(response => response.text())
              .then(data => {
                console.log('Register - TPA template obtained.');
                const projectId = projectScope.projectId;
                const tpa = JSON.parse(data.replace(/1010101010/g, projectId)
                  .replace(/2020202020/g, courseId)
                  .replace(/\$_\[infrastructure\.internal\.assets\.default\]/g, `${config.internalAssetsUrl}`)
                  .replace(/\$_\[infrastructure\.internal\.scopes\.default\]/g, `${config.internalScopeUrl}`));
                if (!tpa.context.infrastructure) { tpa.context.infrastructure = {}; }
                tpa.context.infrastructure.render = `${config.renderUrl}/render?model=${config.registryUrl}/api/v6/agreements/${tpa.id}&view=/renders/tpa/default.html&ctrl=/renders/tpa/default.js`;
                tpa.context.definitions.notifications = projectScope.notifications ? projectScope.notifications : {};
                tpa.type = 'agreement';
                delete tpa._id;
                delete tpa.id;
                const tpaOrdered = {
                  id: 'tpa-' + projectId,
                  templateId: courseTemplateId,
                  ...tpa
                };
                fetch(`${config.registryUrl}/api/v6/agreements`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(tpaOrdered)
                }).then(async response => {
                  console.log('Register - Agreement created.');
                  if(selectedCourse.autoRun){
                    await activateAutomaticTPACalculations(selectedCourse, projectScope);
                    optimizeCalculationPeriod();
                  }
                }).catch((error) => {
                  console.error('Error:', error);
                });
              }).catch(error => {
                console.error('Error fetching tpa template  :', error);
              });
          })
          .catch(error => {
            console.error('Error fetching course -> template id :', error);
          });
        const dashboardURL = `${config.dashboardUrl}/dashboard/script/dashboardLoader.js?dashboardURL=${config.reporterUrl}/api/v4/dashboards/tpa-${projectScope.projectId}/main`;
        if(result.projects[0].oldScope) {
          setGenerationResult({ type: "successUpdate", url: dashboardURL, teamId: projectScope.teamId });
        } else {
          setGenerationResult({ type: "successJoin", url: dashboardURL, teamId: projectScope.teamId });
        }
      } else if (err[0] === 'The is no new changes for this project scope.') {
        const projectScope = result.projects[0].oldScope;
        const dashboardURL = `${config.dashboardUrl}/dashboard/script/dashboardLoader.js?dashboardURL=${config.reporterUrl}/api/v4/dashboards/tpa-${projectScope.projectId}/main`;
        setGenerationResult({ type: "existingProject", url: dashboardURL, teamId: projectScope.teamId });
      } else {
        setGenerationResult("error");
      }
    } else if (result.code === 403) {
      setGenerationResult("invalid");
    } else {
      setGenerationResult("error");
      console.log("Unexpected result from generator:", JSON.stringify(result, null, 2));
    }
  }

  const optimizeCalculationPeriod = () => {
    const taskConfig = { 
      filenameMustIncludeAll: ["tpaCalculation"],
      startingTime: "00:00",
      endingTime: "00:58",
      batchSize: 1
    }
    fetch(`${config.assetsUrl}/api/v1/public/director/tasks/utils/optimizeCalculationPeriod/script.js`)
      .then(response => response.text())
      .then(data => {
        const payload = {
          scriptText: data,
          scriptConfig: taskConfig
        }
        fetch(`${config.directorUrl}/api/v1/tasks/test`, {	
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          })
        })
  }

  // This function is extracted from TPA-Manager microservice
  const activateAutomaticTPACalculations = async (course, project) => {
    const taskBody = createTaskBody(course, project, true);
    try{
      await fetch(`${config.directorUrl}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskBody)
      })
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // This function is extracted from TPA-Manager microservice
  const createTaskBody = (course, project, isRunning) => {
    let calculationConfig = course.calculationConfig || getDefaultCalculationConfig();
    return {
      id: `tpaCalculation-${course.classId}-${project.projectId}`,
      script: `${config.internalAssetsUrl}/api/v1/public/director/tasks/system/requestTpaReport/script.js`,
      running: isRunning,
      config: {
        agreementId: `tpa-${project.projectId}` // This is standard in Bluejay. Do not change
      },
      tags: {
        simple: ['tpaCalculation', 'createdByJoin'],
        keyValue: {
          type: 'tpaCalculation',
          courseId: course.classId,
          projectId: project.projectId
        }
      },
      code: 0, //skips oas warning
      message: "message", //skips oas warning
      ...calculationConfig //stores init, end and interval
    };
  }

  // This function is extracted from TPA-Manager microservice
  const getDefaultCalculationConfig = () => {
    return {
      init: new Date(),
      end: new Date(Date.now() + TpaCalcDuration),
      //Default is Hourly
      interval: 3600000
    }
  };

  // This function is extracted from TPA-Manager microservice
  const TpaCalcDuration = 7 * 30 * 24 * 60 * 60 * 1000; // 7 months

  const fetchCourseJoinCode = async (courseId) => {
    try {
      const response = await fetch(`${config.scopeUrl}/api/v1/scopes/development/${courseId}`)
      const data = await response.json()
      const joinCode = data.scope.joinCode ? data.scope.joinCode : ""
      setCourseJoinCode(joinCode)
      return joinCode
    } catch (error) {
      console.error("Error fetching course join code:", error)
    }
  }

  const resetGeneration = () => {
    setVerifiedRepoURL("")
    setCourseMessage("hidden")
    setGenerationResult("")
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-3xl mx-auto space-y-8">
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-blue-500 text-white">
            <CardTitle className="text-2xl">Welcome to the join-in page!</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="space-y-6">
              <div>
                <h5 className="text-lg font-semibold mb-2 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    1
                  </span>
                  Enter your GitHub or GitLab Repository URL
                </h5>
                <CardDescription className="mb-2">
                  Please enter the URL containing the{" "}
                  <a
                    href="https://github.com/governifyauditor/goldenflow-showcase-project/blob/main/info.yml"
                    className="text-blue-500 hover:underline"
                  >
                    info.yml
                  </a>{" "}
                  file in the <b>main</b> branch to check its validity.
                </CardDescription>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://github.com/governifyauditor/goldenflow-showcase-project"
                    value={repoURL}
                    onChange={(e) => setRepoURL(e.target.value)}
                    onKeyUp={(e) => e.key === "Enter" && check()}
                  />
                  <Button onClick={check}>Check</Button>
                </div>
                <div className="mt-2 text-sm">
                  <span>
                    Don't have an <b>info.yml</b> file?{" "}
                  </span>
                  <a href="/join/wizard" className="text-blue-500 hover:underline">
                    Create one now!
                  </a>
                </div>
                <div className="mt-1 text-sm">
                  <span>Already have a registered project? </span>
                  <a href="/join/badge" className="text-blue-500 hover:underline">
                    Get your own badge here!
                  </a>
                </div>
                {result === "success" && (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Yay!! That repo has a valid <span className="text-blue-500">bluejay</span> info.yml 😊
                    </AlertDescription>
                  </Alert>
                )}
                {result === "error" && (
                  <Alert className="mt-4 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Ups!! There is a problem! 😔 Make sure the repository is accessible and public, and has a correct info.yml
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {courseMessage !== "hidden" && (
                <div className={courseMessage}>
                  <hr className="my-4" />
                  <h5 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      2
                    </span>
                    Register your project in a course
                  </h5>
                  <CardDescription className="mb-2">
                    To register your project, please select a course and click on join!
                  </CardDescription>
                  {courseJoinCode && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter Join Code"
                        value={userJoinCode}
                        onChange={(e) => setUserJoinCode(e.target.value)}
                        onKeyUp={(e) => e.key === "Enter" && generate()}
                      />
                    </div>
                  )}
                  <div className="flex space-x-2 mt-4">
                    <Select value={courseCode} onValueChange={(value) => {
                      setCourseCode(value)
                      fetchCourseJoinCode(value)
                      const selected = courses.find(course => course.classId === value)
                      setSelectedCourse(selected)
                      setGenerationResult("")
                      setShowMoreInfo(false)
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.classId} value={course.classId}>
                            {course.classId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={generate}>Join</Button>
                  </div>
                  {generationResult === "error" && (
                    <Alert className="mt-4 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Ups!! There is a problem! 😔 Please try again or contact admin.
                      </AlertDescription>
                    </Alert>
                  )}
                  {generationResult === "invalid" && (
                    <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertTitle>Invalid Course</AlertTitle>
                      <AlertDescription>This course code does not exist 😲! Please enter a valid one.</AlertDescription>
                    </Alert>
                  )}
                  {generationResult === "invalidJoinCode" && (
                    <Alert className="mt-4 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle>Invalid Join Code</AlertTitle>
                      <AlertDescription>The join code you entered is incorrect. Please try again.</AlertDescription>
                    </Alert>
                  )}
                  {generationResult.type === "successJoin" && (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>Successful Join</AlertTitle>
                      <AlertDescription>
                      Congrats! Your project has successfully joined Bluejay!{" "}
                        <DashboardBadge url={generationResult.url} teamId={generationResult.teamId} hidden={selectedCourse.hideDashboardLink}/>
                      </AlertDescription>
                    </Alert>
                  )}
                  {generationResult.type === "successUpdate" && (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>Successful Update</AlertTitle>
                      <AlertDescription>
                      Congrats! Your existing project has successfully updated!{" "}
                        <DashboardBadge url={generationResult.url} teamId={generationResult.teamId} hidden={selectedCourse.hideDashboardLink}/>
                      </AlertDescription>
                    </Alert>
                  )}
                  {generationResult.type === "existingProject" && (
                    <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertTitle>Project Already Exists</AlertTitle>
                      <AlertDescription>
                        The project already exists within the scope and the info.yml don't have changes.{" "}
                          <DashboardBadge url={generationResult.url} teamId={generationResult.teamId} hidden={selectedCourse.hideDashboardLink}/>
                        <MoreInfo showMoreInfo={showMoreInfo} setShowMoreInfo={setShowMoreInfo} />
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default JoinView