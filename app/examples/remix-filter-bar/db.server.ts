/**
 * This is a mock database and the database schema is defined here
 */

const statuses = ["todo", "in-progress", "in-review", "done"] as const
const priorities = ["low", "medium", "high"] as const
const labels = [
  "bug",
  "feature",
  "enhancement",
  "documentation",
  "help-wanted",
  "good-first-issue",
  "invalid",
  "wontfix",
  "question",
] as const

export type Issue = {
  id: string
  title: string
  description: string
  status: typeof statuses[number]
  priority: typeof priorities[number]
  assigneeId: string
  label: typeof labels[number]
  creatorId: string
  parentIssueId: string | null
  blockedByIssueIds: Array<string | null>
  referencesIssueIds: Array<string | null>
  duplicateOfIssueId: string | null
  createdDate: string
  triagedDate: string | null
  startedDate: string | null
  updatedDate: string
  dueDate: string | null
}

export type User = {
  id: string
  name: string
  createdIssues: Array<Issue["id"]>
  assignedIssues: Array<Issue["id"]>
}

declare global {
  var db__remixFilterBar: {
    statuses: typeof statuses
    priorities: typeof priorities
    labels: typeof labels
    users: Array<User>
    issues: Array<Issue>
  }
}

if (!global.db__remixFilterBar) {
  global.db__remixFilterBar = {
    statuses,
    priorities,
    labels,
    users: [],
    issues: [],
  }
  global.db__remixFilterBar.users = generateUsers(15)
  global.db__remixFilterBar.issues = generateIssues(1000)
}

export default global.db__remixFilterBar

function generateUsers(quantity: number) {
  const users: Array<User> = []
  const names = getRandomUserNames(quantity)

  for (let i = 0; i < quantity; i++) {
    users.push({
      id: `${i}`,
      name: names[i],
      createdIssues: [],
      assignedIssues: [],
    })
  }

  return users

  function getRandomUserNames(quantity: number) {
    const names = [
      "Adela",
      "Bob",
      "Carly",
      "Dave",
      "Eve",
      "Frank",
      "Grace",
      "Heidi",
      "Ivan",
      "Judy",
      "Kent",
      "Lizzie",
      "Michael",
      "Niaj",
      "Oscar",
      "Pauline",
      "Quentin",
      "Ryan",
      "Sergio",
      "Trent",
      "Ursula",
      "Violeta",
      "Walter",
      "Xavier",
      "Yvonne",
      "Zelda",
    ]

    const selected: Array<string> = []

    for (let i = 0; i < quantity; i++) {
      const name = getRandomValue(names)
      selected.push(name)
      names.splice(names.indexOf(name), 1)
    }

    return selected
  }
}

function generateIssues(quantity: number) {
  const issues: Array<Issue> = []

  for (let i = 0; i < quantity; i++) {
    const createdDate = getRandomDate()
    const triagedDate = getRandomDate(new Date(createdDate))
    const startedDate = getRandomDate(new Date(triagedDate))
    const updatedDate = getRandomDate(new Date(startedDate))
    const dueDate = getRandomDate(new Date(updatedDate))

    issues.push({
      id: `${i}`,
      title: getRandomStoryName(),
      description: `Issue ${i} description`,
      status: getRandomValue(statuses),
      priority: getRandomValue(priorities),
      assigneeId: getRandomValue(global.db__remixFilterBar.users).id,
      label: getRandomValue(labels),
      creatorId: getRandomValue(global.db__remixFilterBar.users).id,
      parentIssueId: callbackOrNull(
        0.1,
        () => `${Math.max(0, i - Math.floor(Math.random() * 10))}`,
      ),
      blockedByIssueIds: [
        callbackOrNull(
          0.05,
          () => `${Math.max(0, i - Math.floor(Math.random() * 10))}`,
        ),
        callbackOrNull(
          0.05,
          () => `${Math.max(0, i - Math.floor(Math.random() * 10))}`,
        ),
      ],
      referencesIssueIds: [
        callbackOrNull(
          0.05,
          () => `${Math.max(0, i - Math.floor(Math.random() * 10))}`,
        ),
        callbackOrNull(
          0.05,
          () => `${Math.max(0, i - Math.floor(Math.random() * 10))}`,
        ),
      ],
      duplicateOfIssueId: callbackOrNull(
        0.05,
        () => `${Math.max(0, i - Math.floor(Math.random() * 10))}`,
      ),
      createdDate: createdDate,
      triagedDate: callbackOrNull(0.5, () => triagedDate),
      startedDate: callbackOrNull(0.5, () => startedDate),
      updatedDate: updatedDate,
      dueDate: callbackOrNull(0.5, () => dueDate),
    })
  }

  return issues

  function getRandomStoryName() {
    const prefix = "As"
    const agents = [
      "a user",
      "the idea guy",
      "a developer",
      "an admin",
      "a manager",
      "a customer",
      "a tester",
      "a designer",
      "a product owner",
      "an intern",
      "a barista",
    ]
    const actions = [
      "I want to",
      "I need to",
      "I would like to",
      "I should",
      "I must",
      "I would love to",
    ]
    const verbs = [
      "create",
      "read",
      "update",
      "delete",
      "edit",
      "view",
      "delete",
      "add",
      "remove",
      "change",
      "modify",
      "assign",
      "unassign",
      "filter",
      "sort",
      "search",
    ]
    const nouns = [
      "the issues",
      "the projects",
      "the users",
      "the comments",
      "the tasks",
      "the labels",
      "the milestones",
      "the epics",
      "the groups",
      "the boards",
      "the sprints",
      "the releases",
      "the candidates",
      "the content",
    ]
    const reasons = [
      "so that I can save time",
      "so that I can save money",
      "so that it's better for the environment",
      "so that we make more sales",
      "to make sure everything is correct",
      "so that someone will finally love me",
      "so that I know what to do",
      "so that I can be more organized",
      "so that I can see the state of the project",
      "so that I can find what I want",
      "in order to download them",
      "in order to delete them",
      "in order to test them",
    ]

    return [
      prefix,
      getRandomValue(agents),
      getRandomValue(actions),
      getRandomValue(verbs),
      getRandomValue(nouns),
      getRandomValue(reasons),
    ].join(" ")
  }
}

function callbackOrNull<T>(odds: number, callback: () => T) {
  return Math.random() < odds ? callback() : null
}

function getRandomValue<T>(array: ReadonlyArray<T>) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate(
  start: Date = new Date(2020, 0, 1),
  end: Date = new Date(),
) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  ).toISOString()
}
