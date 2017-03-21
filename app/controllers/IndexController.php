<?php


//namespace RestApi\Api\Controllers;

use Phalcon\Mvc\Controller;
use Phalcon\Http\Response;
use Phalcon\Http\Request;


class IndexController extends RestController {

    /**
     * @Get("/api/tasks/")
     */
    public function tasksParamsAction() {

        $params = array();

        if (isset($_GET[state])) {
            $state = $_GET[state];
            $params["conditions"] = "state = '$state'";
        } else {
            //$params["group"] = "state";
        }

        if (isset($_GET[state])) {
            $state = $_GET[state];
            $params["conditions"] = "state = '$state'";
        } else {
            //$params["group"] = "state";
        }

        if (isset($_GET[limit])) {
            $limit = $_GET[limit];
            $params["limit"] = $limit;
        }

        if (isset($_GET[group])) {
            $group = $_GET[group];
            $params["group"] = $group;
        }

        if (isset($_GET[offset])) {
            $offset = $_GET[offset];
            $params["offset"] = $offset;
        }

        $state = States::findFirst($_GET[state]);

        $params["order"] = "priority DESC";

        $response = new Response();

        if (isset($_GET[from])) {
            $from = $_GET[from];
            if (isset($params["conditions"])) {
                $params["conditions"] .= ' AND ';
            }
            $params["conditions"] .= " (modified >= '$from' OR created >= '$from')";

            if (isset($_GET[to])) {
                $to = $_GET[to];
                $params["conditions"] .= " AND (modified <= '$to' OR created <= '$to' )";
            }
        } else {
            if (isset($_GET[to])) {
                $to = $_GET[to];
                $params["conditions"] .= " (modified <= '$to' OR created <= '$to' )";
            }
        }

        if (isset($_GET[id])) {
            $id = $_GET[id];
            if (isset($params["conditions"])) {
                $params["conditions"] .= ' AND ';
            }

            $params["conditions"] .= " (id = '$id')";
        }

        $tasks = Tasks::find($params);

        $counters[0] = Tasks::find(array(
                                 "state = '1'"
                                ))->count();

        $counters[1] = Tasks::find(array(
                                       "state = '2'"
                                   ))->count();

        $counters[2] = Tasks::find(array(
                                       "state = '3'"
                                   ))->count();

        $counters[3] = Tasks::find(array(
                                       "state = '4'"
                                   ))->count();

        $counters[4] = Tasks::find(array(
                                       "state = '5'"
                                   ))->count();

        $response->setStatusCode(201, "Success");

        $tasks->rewind();

        while ($tasks->valid()) {

            if (isset($_GET[tag])) {

                $tag__id = $_GET[tag];
                $tagCheck = Tags::findFirst($tag__id);


                $tagBinding = Tagbinding::find(array(
                    "conditions" => "task__id =".$tasks->current()->id." AND tag__id=".$tagCheck->id
                ));


                if (count($tagBinding->toArray()) > 0) {
                    $task = $tasks->current()->toArray();
                } else {
                    $tasks->next();
                    continue;
                }
            } else {
                $task = $tasks->current()->toArray();

            }

            $task['tags'] = $tasks->current()->Tags->toArray();
            $task['screenshots'] = $tasks->current()->Screenshots->toArray();
            $task['description'] = nl2br($tasks->current()->description, true);
            $task['users'] = array();

            foreach ($tasks->current()->Userbinding as $user) {
                $task['users'][$user->Roles->name] = $user->Users->name;
            }

            $task['comments'] = [];

            if ($tasks->current()->Comments) {
                foreach ($tasks->current()->Comments as $comment) {
                    $task['comments'][] = array(
                        'user'    => Users::findFirst($comment->user_id)->name,
                        'comment' => $comment->comment,
                        'created' => $comment->created,
                        'id' => $comment->id
                    );
                }
            }

            $data[] = $task;
            $tasks->next();
        }

        $response->setJsonContent(
            array(
                'status' => 'Success',
                'tasks'   => $data,
                'state'  =>  $state->toArray(),
                'counters'  =>  $counters
            )
        );

        return $response;
    }

    /**
     * @Get("/api/tasks/dashboard/")
     */
    public function tasksDashboardAction() {

        $params = array();
        $params["order"] = "created DESC";

        // Setting current user
        $currentUserId = $this->session->get("user")['id'];
        $currentUser = Users::findFirst($currentUserId);

        $tasks = Tasks::find($params);
        $tasks->rewind();

        while ($tasks->valid()) {

            $task['users'] = array();

            foreach ($tasks->current()->Userbinding as $user) {
                $task['users'][$user->Roles->name] = $user->Users->name;
            }

            if (in_array ($currentUser->name, $task['users'])) {

                $task = $tasks->current()->toArray();

                foreach ($tasks->current()->Userbinding as $user) {
                    $task['users'][$user->Roles->name] = $user->Users->name;
                }

                $task['tags'] = $tasks->current()->Tags->toArray();
                $task['screenshots'] = $tasks->current()->Screenshots->toArray();
                $task['description'] = nl2br($tasks->current()->description, true);
                $task['comments'] = [];

                if ($tasks->current()->Comments) {
                    foreach ($tasks->current()->Comments as $comment) {
                        $task['comments'][] = array(
                            'user'    => Users::findFirst($comment->user_id)->name,
                            'comment' => $comment->comment,
                            'id' => $comment->id,
                        );
                    }

                }

                if ( $task['marker'] == 'Runtime' ) {
                    $timelog[] = $task;
                } else {
                    if ($task['users']['assignee'] ==  $currentUser->name) {
                        $assigned[$task[state]][] = $task;
                    }

                    if ($task['users']['creator'] ==  $currentUser->name) {
                        $created[$task[state]][] = $task;
                    }
                }

            }

            $tasks->next();

        }

        $response = new Response();
        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status'    => 'Success',
                'assigned'  => $assigned,
                'created'   => $created,
                'states'    => States::find()->toArray()
                //'state'     =>  $state->toArray(),
                //'counters'  =>  $counters
            )
        );

        return $response;
    }

    /**
     * @Get("/api/tasks/report/")
     */
    public function tasksReportAction() {

        $params = array();

        if (isset($_GET[limit])) {
            $limit = $_GET[limit];
            $params["limit"] = $limit;
        }

        if (isset($_GET[group])) {
            $group = $_GET[group];
            $params["group"] = $group;
        }

        if (isset($_GET[offset])) {
            $offset = $_GET[offset];
            $params["offset"] = $offset;
        }

        $state = States::findFirst(5);

        $params["order"] = "created DESC";

        $params["conditions"] = ' state=5 ';

        $response = new Response();

        if (isset($_GET[from])) {
            $from = $_GET[from];
            if (isset($params["conditions"])) {
                $params["conditions"] .= ' AND ';
            }
            $params["conditions"] .= " (modified >= '$from' OR created >= '$from')";

            if (isset($_GET[to])) {
                $to = $_GET[to];
                $params["conditions"] .= " AND (modified <= '$to' OR created <= '$to' )";
            }
        } else {
            if (isset($_GET[to])) {
                $to = $_GET[to];
                $params["conditions"] .= " (modified <= '$to' OR created <= '$to' )";
            }
        }

        $tasks = Tasks::find($params);

        $counters[0] = Tasks::find(array(
                                       "state = '1'"
                                   ))->count();

        $counters[1] = Tasks::find(array(
                                       "state = '2'"
                                   ))->count();

        $counters[2] = Tasks::find(array(
                                       "state = '3'"
                                   ))->count();

        $counters[3] = Tasks::find(array(
                                       "state = '4'"
                                   ))->count();

        $counters[4] = Tasks::find(array(
                                       "state = '5'"
                                   ))->count();

        $response->setStatusCode(201, "Success");

        $tasks->rewind();

        while ($tasks->valid()) {

            //print_r($tasks->current()->marker);
            if ($tasks->current()->marker == "Runtime") {

                if (isset($_GET[tag])) {

                    $tag__id = $_GET[tag];
                    $tagCheck = Tags::findFirst($tag__id);

                    $tagBinding = Tagbinding::find(array(
                                                       "conditions" => "task__id =".$tasks->current()->id." AND tag__id=".$tagCheck->id
                                                   ));


                    if (count($tagBinding->toArray()) > 0) {
                        $task = $tasks->current()->toArray();
                    } else {
                        $tasks->next();
                        continue;
                    }
                } else {
                    $task = $tasks->current()->toArray();

                }

                //$task['tags'] = $tasks->current()->Tags->toArray();
                //$task['screenshots'] = $tasks->current()->Screenshots->toArray();
                //$task['description'] = nl2br($tasks->current()->description, true);
                $task['users'] = array();

                foreach ($tasks->current()->Userbinding as $user) {
                    $task['users'][$user->Roles->name] = $user->Users->name;
                }

//                $task['comments'] = [];

//                if ($tasks->current()->Comments) {
//                    foreach ($tasks->current()->Comments as $comment) {
//                        $task['comments'][] = array(
//                            'user'    => Users::findFirst($comment->user_id)->name,
//                            'comment' => $comment->comment,
//                            'id' => $comment->id,
//                        );
//                    }
//
//                }

                $timestamp = date ("Y.m.d", strtotime($task['modified']));

                $pre_data["$timestamp"][] = $task;
            }

            $tasks->next();
        }

        foreach ($pre_data as $date => $tasklist) {
            $data[] = array (
                'date' => $date,
                'tasklist' => $tasklist
            );
        }

        $response->setJsonContent(
            array(
                'status' => 'Success',
                'tasksReport'   => $data,
                'state'  =>  $state->toArray(),
                'counters'  =>  $counters
            )
        );

        return $response;
    }

    /**
     * @Get("/api/tasks/{id:[0-9]+}")
     */
    public function getTaskAction($id)  {
        $response = new Response();
        $task = Tasks::findFirst($id);

        if ($task->count() > 0) {
            $response->setStatusCode(201, "Success");

            $task = $task->toArray();
            $response->setJsonContent(
                array(
                    'status' => 'Success',
                    'action' => 'found',
                    'task'   => $task
                )
            );

        } else {
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status'   => 'Not found any task'
                )
            );
        }

        return $response;
    }

    /**
     * @Delete("/api/tasks/{id:[0-9]+}")
     */
    public function deleteTaskAction($id)  {
        $response = new Response();
        $task = Tasks::findFirst($id);

        if ( $task != false) {

            if ($task->delete() != false) {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'OK',
                        'action' => 'deleted'
                    )
                );
            } else {
                $response->setStatusCode(409, "Conflict");

                // Send errors to the client
                $errors = array();
                foreach ($task->getMessages() as $message) {
                    $errors[] = $message->getMessage();
                }

                $response->setJsonContent(
                    array(
                        'status'   => 'ERROR',
                        'messages' => $errors
                    )
                );
            }

        } else {
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status'   => 'Not found any task'
                )
            );
        }

        return $response;
    }

    /**
     * @Post("/api/tasks/")
     */
    public function newTaskAction() {
        $response = new Response();
        $request = $this->request->getPost();

        $task = new Tasks();

        $task->task = $request["task"];
        $task->marker = $request["marker"];
        $task->description = $request["description"];
        $task->deadline = $request["deadline"];
        $task->ticket = $request["ticket"];
        $task->time__spent = $request["time"];
        $task->state = $request["state"]? $request["state"] : 1;

        // Assigning creator
        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

        $role = Roles::findFirst("1");

        $userBinding = new Userbinding();
        $userBinding->Tasks = $task;
        $userBinding->Users = $user;
        $userBinding->Roles = $role;

        // Assigning assignee

        if ($request["assignee"]) {
            $assigneeId = $request["assignee"];
            $assignee = Users::findFirst($assigneeId);

            $assigneeRole = Roles::findFirst("2");

            $userBindingAssignee = new Userbinding();
            $userBindingAssignee->Tasks = $task;
            $userBindingAssignee->Users = $assignee;
            $userBindingAssignee->Roles = $assigneeRole;
        } else {
            $assigneeRole = Roles::findFirst("2");

            $userBindingAssignee = new Userbinding();
            $userBindingAssignee->Tasks = $task;
            $userBindingAssignee->Users = $user;
            $userBindingAssignee->Roles = $assigneeRole;
        }

        if ( ($userBinding->create() != false) && ($userBindingAssignee->create() != false)) {

            $response->setStatusCode(201, "Success");

            $data = $task->toArray();

            $data['tags'] = $task->Tags->toArray();
            $data['screenshots'] = $task->Screenshots->toArray();
            $data['description'] = nl2br($task->description, true);
            $data['users'] = array();

            foreach ($task->Userbinding as $user) {
                //die($user->Users->name);
                $data['users'][$user->Roles->name] = $user->Users->name;
            }

            $data['comments'] = [];

            if ($task->Comments) {
                foreach ($task->Comments as $comment) {
                    $data['comments'][] = array(
                        'user'    => Users::findFirst($comment->user_id)->name,
                        'comment' => $comment->comment,
                        'id' => $comment->id,
                    );
                }
            }

            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'task'   => $data
                )
            );

        } else {

            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($userBinding->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            foreach ($userBindingAssignee->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors
                )
            );
        }

        return $response;

    }

    /**
     * @Put("/api/tasks/{task:[0-9]+}/modify")
     */
    public function modifyTaskAction($task) {
        $response = new Response();

        $tag = $this->request->getPut("tag");
        $tagDel = $this->request->getPut("tagDel");
        $commentDel = $this->request->getPut("commentDel");
        $screenshotDel = $this->request->getPut("screenshotDel");
        $assignee = $this->request->getPut("assignee");
        $ticket = $this->request->getPut("ticket");
        $deadline = $this->request->getPut("deadline");
        $priority = $this->request->getPut("priority");
        $screenshot = $this->request->getPut("screenshot");
        $comment = $this->request->getPut("comment");
        $description = $this->request->getPut("description");
        $time = $this->request->getPut("time");
        $taskEdit = $this->request->getPut("task");
        $state = $this->request->getPut("state");
        $timeComment = $this->request->getPut("timeComment");

        $task = Tasks::findFirst($task);

        if ($task) {

            if ($time) {

                $task->time__spent = $task->time__spent + $time;

                $timer = new Tasks();
                $timer->marker = "Runtime";
                $timer->task = $task->task;
                $timer->time__spent = $time;
                $timer->state = 5;
                $timer->description = $timeComment;

                $userId = $this->session->get("user")['id'];
                $timingUser = Users::findFirst($userId);

                $userBindingAssignee = new Userbinding();
                $userBindingAssignee->Tasks = $timer;
                $userBindingAssignee->Users = $timingUser;
                $userBindingAssignee->Roles = Roles::findFirst("2");

                if ($userBindingAssignee->create() == false) {
                    foreach ($userBinding->getMessages() as $message) {
                        $errors[] = $message;
                    }
                    $response->setStatusCode(201, "Success");
                    $response->setJsonContent(
                        array(
                            'status' => 'Could not update it',
                            'errors'   => $errors
                        )
                    );
                }

            }
            if ($screenshot) {

                $screen = new Screenshots();
                $screen->link =  $screenshot;
                $screen->task_id = $task->id;

                $screen->create();

            }
            if ($state) {
                $state = States::findFirst($state);
                if ($state->count() > 0) {
                    $task->state = $state->id;
                    if ($state->id == 5) {
                        $testerRole = Roles::findFirst("3");

                        $userId = $this->session->get("user")['id'];
                        $tester = Users::findFirst($userId);

                        $userBindingTester = new Userbinding();
                        $userBindingTester->Tasks = $task;
                        $userBindingTester->Users = $tester;
                        $userBindingTester->Roles = $testerRole;

                        $userBindingTester->create();
                    }
                }
            }
            if ($comment) {

                $newComment = new Comments();
                $newComment->comment =  $comment;
                $newComment->task_id = $task->id;
                $newComment->user_id = $this->session->get("user")['id'];

                $newComment->create();

            }
            if (isset($deadline)) {
                $task->deadline = $deadline;
            }
            if ($priority) {
                $task->priority = $priority;
            }
            if ($assignee) {

                $assigneeRole = Roles::findFirst("2");

                $UBtoDelete = Userbinding::find(array(
                                      "conditions" => "task_id='". $task->id ."' AND role_id=2"
                                  )
                );

                $UBtoDelete->delete();
                $userBindingAssignee = new Userbinding();
                $userBindingAssignee->Tasks = $task;
                $userBindingAssignee->Users = Users::findFirst($assignee);
                $userBindingAssignee->Roles = $assigneeRole;

                if ($userBindingAssignee->create()) {


                } else {
                    foreach ($userBindingAssignee->getMessages() as $message) {
                        $errors[] = $message->getMessage();
                    }

                    $response->setJsonContent(
                        array(
                            'status'   => 'ERROR',
                            'messages' => $errors
                        )
                    );

                    return $response;
                }
            }
            if ($ticket) {
                $task->ticket = $ticket;
            }
            if ($taskEdit) {
                $task->task = $taskEdit;
            }
            if ($description) {
                $task->description = $description;
            }
            if ($tag) {
                $newTag = Tags::findFirst("name = '$tag'");
                $newTagBind = Tagbinding::findFirst(array(
                                                        "task__id = '$task->id' AND tag__id = '$newTag->id'"
                                                    ));
                if(! $newTagBind) {
                    if ($newTag) {
                        $newTagBind = new Tagbinding;
                        $newTagBind->Tags = $newTag;
                        $newTagBind->Tasks = $task;
                        $newTagBind->create();
                    } else {
                        $newTag = new Tags;
                        $newTag->name = $tag;
                        $task->Tags = $newTag;
                    }
                } else {
                    //$newTagBind->delete();
                }
            }
            if ($commentDel) {
                $deleteComment = Comments::findFirst($commentDel);
                $deleteComment->delete();
            }
            if ($screenshotDel) {
                $screenshotComment = Screenshots::findFirst($screenshotDel);
                $screenshotComment->delete();
            }
            if ($tagDel) {
                $newTag = Tags::findFirst($tagDel);
                $newTagBind = Tagbinding::findFirst(array(
                                                        "task__id = '$task->id' AND tag__id = '$newTag->id'"
                                                    ));
                $newTagBind->delete();
            }

            /* Updating the task */

            if ($task->update() != false) {
                $response->setStatusCode(201, "Success");

                $data = $task->toArray();

                $data['tags'] = $task->Tags->toArray();
                $data['description'] = nl2br($task->description, true);

                $data['users'] = array();
                foreach ($task->Userbinding as $user) {
                    $data['users'][$user->Roles->name] = $user->Users->name;
                }

                $data['screenshots'] = $task->Screenshots->toArray();

                foreach ($task->Comments as $comment) {
                    $data['comments'][] = array(
                        'user'    => $this->session->get("user")['name'],
                        'comment' => $comment->comment,
                        'created' => $comment->created,
                        'id' => $comment->id,
                    );
                }

                $response->setJsonContent(
                    array(
                        'status' => 'Success',
                        'tasks'   => $data
                    )
                );
            } else {
                foreach ($task->getMessages() as $message) {
                    $errors[] = $message;
                }
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'Could not update it',
                        'errors'   => $errors
                    )
                );
            }

            /* ! Updating the task */

        } else {
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status' => 'No such task',
                )
            );
        }

        return $response;

    }

    /**
     * @Post("/api/users/login")
     */
    public function loginAction() {
        $response = new Response();
        $request = $this->request->getPost();

        $login       = $this->request->getPost('login');
        $password    = $this->request->getPost('password');


        $user = Users::findFirstByLogin($login);

        //print_r($password);
        //print_r($user->password);
        //print_r($user->password);

        if ($user) {
            if ($this->security->checkHash($password, $user->password)) {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'OK',
                        'action' => 'logged',
                        'data'   => $user
                    )
                );

                //var_dump($_COOKIE);

                setcookie("user", $user->toArray());
                $this->session->set("user", $user->toArray());

            } else {
                // Change the HTTP status
                $response->setStatusCode(409, "Conflict");

                // Send errors to the client
                $response->setJsonContent(
                    array(
                        'status'   => 'WRONG PASSWORD',
                    )
                );

            }

        } else {
            // Change the HTTP status
            $response->setStatusCode(404, "Not found");

            // Send errors to the client
            $response->setJsonContent(
                array(
                    'status'   => 'NO SUCH USER',
                )
            );
        }

        return $response;

    }

    /**
     * @Get("/api/users/logout")
     */
    public function logoutAction() {
        $response = new Response();

        setcookie("user", '');
        $this->session->destroy();

        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status' => 'OK',
                'action' => 'logged out',
            )
        );

        return $response;

    }

    /**
     * @Get("/api/users/current")
     */
    public function currentUserAction() {

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst(
            array(
                "id = '$userId'"
            )
        );

        $this->response->setJsonContent(
            $user->toArray()
        );

        return $response;

    }

    /**
     * @Put("/api/users/")
     */
    public function updateUserAction() {
        $response = new Response();

        $request = $this->request->getPut();

        $user = Users::findFirst($this->request->getPut('id'));


        if (isset ($request['login'] ) ) {
            $user->login       = $this->request->getPut('login');
        }

        if (isset ($request['name'] ) ) {
            $user->name        = $this->request->getPut('name');
        }

        if (isset ($request['email'] ) ) {
            $user->email       = $this->request->getPut('email');
        }

        if (isset ($request['color'] ) ) {
            $user->color       = $this->request->getPut('color');
        }

        if (isset ($request['password'] ) ) {
            $user->password    = $this->security->hash($this->request->getPut('password'));
        }


        if ($user->update() == true) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'updated',
                    'data'   => $user
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($user->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors
                )
            );
        }

        return $response;

    }

    /**
     * @Get("/api/users/")
     */
    public function usersAction() {

        $response = new Response();

        $users = Users::find(array(
            "columns" => "id, login, name, permissions"
                             ));
        $users->rewind();

        while ($users->valid()) {
            $user[] = $users->current()->toArray();
            $users->next();
        }

        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status' => 'OK',
                'action' => 'found',
                'data'   => $user
            )
        );

        return $response;

    }

    /**
     * @Post("/api/users/register")
     */
    public function registerAction() {
        $response = new Response();
        $request = $this->request->getPost();

        $user = new Users;

        //var_dump($this->request->getPost());
        //die($this->request->getPost());

        $user->login       = $this->request->getPost('login');
        $user->name        = $this->request->getPost('name');
        $user->email       = $this->request->getPost('email');
        $user->password    = $this->security->hash($this->request->getPost('password'));



        if ($user->create() == true) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'data'   => $user
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($user->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors
                )
            );
        }

        return $response;

    }

    /**
     * @Get("/api/tags/")
     */
    public function tagsAction() {

        $response = new Response();

        $tags = Tags::find();
        $tags->rewind();

        while ($tags->valid()) {
            $tag[] = $tags->current()->toArray();
            $tags->next();
        }

        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status' => 'OK',
                'action' => 'found',
                'data'   => $tag
            )
        );

        return $response;

    }

    /**
     * @Put("/api/tags/{tag:[0-9]+}")
     */
    public function tagsModifyAction($tagId) {

        $response = new Response();
        $request = $this->request->getPut();

        $tag = Tags::findFirst($tagId);

        if ($tag) {

            $name        = $this->request->getPut("name");
            $description = $this->request->getPut("description");

            if ($name) { $tag->name = $name; }
            if ($description) { $tag->description = $description; }

            if ($tag->update() != false) {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'OK',
                        'action' => 'found',
                        'data'   => $tag
                    )
                );
            }

        } else {
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status' => 'No such tag',
                )
            );
        }


        return $response;

    }

    /**
     * @Post("/api/tags/")
     */
    public function tagsCreateAction() {

        $response = new Response();
        $request = $this->request->getPut();

        $name        = $this->request->getPost("name");
        $description = $this->request->getPost("description");

        $tag = Tags::findFirst("name = '$name'");

        if (!$tag) {

            $tag = new Tags();

            $tag->name = $name;
            $tag->description = $description;

            if ($tag->create() != false) {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'OK',
                        'action' => 'Created',
                        'tag'   => $tag
                    )
                );
            } else {
                $response->setStatusCode(400, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'Already exists'
                    )
                );
            }

        } else {
            $response->setStatusCode(400, "Not found");
            $response->setJsonContent(
                array(
                    'status' => 'Already exists'
                )
            );
        }


        return $response;

    }

    /**
     * @Delete("/api/tags/{id:[0-9]+}")
     */
    public function deleteTagAction($id)  {
        $response = new Response();
        $tag = Tags::findFirst($id);

        if ( $tag != false) {

            if ($tag->delete() != false) {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'OK',
                        'action' => 'deleted'
                    )
                );
            } else {
                $response->setStatusCode(409, "Conflict");

                // Send errors to the client
                $errors = array();
                foreach ($tag->getMessages() as $message) {
                    $errors[] = $message->getMessage();
                }

                $response->setJsonContent(
                    array(
                        'status'   => 'ERROR',
                        'messages' => $errors
                    )
                );
            }

        } else {
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status'   => 'Not found any task'
                )
            );
        }

        return $response;
    }

    /**
     * @Get("/api/tasks/report/time/overall/")
     */
    public function tasksReportTimeOverallAction() {

        $params = array();

        if (isset($_GET[limit])) {
            $limit = $_GET[limit];
            $params["limit"] = $limit;
        }

        $state = States::findFirst(5);
        $params["order"] = "created DESC";
        $params["conditions"] = ' state=5 ';

        $response = new Response();

        $tasks = Tasks::find($params);

        $response->setStatusCode(201, "Success");

        $tasks->rewind();

        while ($tasks->valid()) {

            if ($tasks->current()->marker == "Runtime") {

                $task = $tasks->current()->toArray();
                $timestamp = date ("Y.m.d", strtotime($task['modified']));

                if ((date ("m", time()) - date ("m", strtotime($task['created']))) < 2 ) {
                    $pre_data["$timestamp"]["spent"] += $task['time__spent'];
                }

            }

            $tasks->next();
        }

        foreach ($pre_data as $date => $tasklist) {
            $data[] = array (
                'date' => $date,
                'spent' => $tasklist["spent"]
            );
        }

        $response->setJsonContent(
            array(
                'status' => 'Success',
                'data'   => $data
            )
        );

        return $response;
    }

    /**
     * @Get("/api/tasks/report/users/")
     */
    public function tasksReportUsersAction() {

        $params = array();

        if (isset($_GET[limit])) {
            $limit = $_GET[limit];
            $params["limit"] = $limit;
        }

        $state = States::findFirst(5);
        $params["order"] = "created DESC";
        $params["conditions"] = ' state=5 ';

        //die(date(time() - 60*60*24*60));
        $from = date("Y-m-d | h:i:sa", time() - 60*60*24*7*10);

        $params["conditions"] .= " AND (modified >= '$from' OR created >= '$from')";


        $response = new Response();

        $tasks = Tasks::find($params);

        $response->setStatusCode(201, "Success");

        $tasks->rewind();

        while ($tasks->valid()) {

            if ($tasks->current()->marker == "Runtime") {

                $task = $tasks->current()->toArray();

                $task['users'] = array();

                foreach ($tasks->current()->Userbinding as $user) {
                    $task['users'][$user->Roles->name] = $user->Users->name;
                }

                $user = $task['users']['assignee'];
                $timestamp = date ("Y.m.d", strtotime($task['modified']));

                $pre_data["$user"]["$timestamp"]["spent"]   += $task['time__spent'];
                $pre_data["$user"]["$timestamp"]["tasks"][] = array(
                    "spent" => $task['time__spent'],
                    "task" => $task['task'],
                    "description" => $task['description']
                );

            }

            $tasks->next();
        }

        foreach ($pre_data as $user => $tasklist) {
            $data[] = array (
                'user' => $user,
                'datelist' => $tasklist
            );
        }

        $response->setJsonContent(
            array(
                'status' => 'Success',
                'data'   => $data
            )
        );

        return $response;
    }

    /**
     * @Get("/api/tasks/report/projects/days/")
     */
    public function tasksReportProjectsDaysAction() {

        $params = array();

        if (isset($_GET[limit])) {
            $limit = $_GET[limit];
            $params["limit"] = $limit;
        }

        $state = States::findFirst(5);
        $params["order"] = "created DESC";
        $params["conditions"] = ' state=5 ';

        //die(date(time() - 60*60*24*60));
        $from = date("Y-m-d | h:i:sa", time() - 90*60*24*7*5);

        $params["conditions"] .= " AND (modified >= '$from' OR created >= '$from')";

        $response = new Response();

        $tasks = Tasks::find($params);

        $response->setStatusCode(201, "Success");

        $tasks->rewind();

        while ($tasks->valid()) {

            if ($tasks->current()->marker == "Runtime") {

                $task = $tasks->current()->toArray();

                $task['users'] = array();

                foreach ($tasks->current()->Userbinding as $user) {
                    $task['users'][$user->Roles->name] = $user->Users->name;
                }

                $taskName = $task['task'];
                $timestamp = date ("Y.m.d", strtotime($task['modified']));

                $pre_data["$taskName"]["$timestamp"]["spent"]   += $task['time__spent'];

                $pre_data["$taskName"]["$timestamp"]["tasks"][] = array(
                    "spent" => $task['time__spent'],
                    "task" => $task['task'],
                    "description" => $task['description'],
                    "user" => $task['users']['assignee']
                );

            }

            $tasks->next();
        }

        foreach ($pre_data as $taskItem => $tasklist) {

            if (count($tasklist) > 2) {
                $data[] = array (
                    'task' => $taskItem,
                    'datelist' => $tasklist
                );
            }


        }

        $response->setJsonContent(
            array(
                'status' => 'Success',
                'data'   => $data
            )
        );

        return $response;
    }

    /**
     * @Get("/api/tasks/report/projects/")
     */
    public function tasksReportProjectsAction() {

        $params = array();
        $params["order"] = "created DESC";
        $params["conditions"] = ' state=5 ';

        $from = date("Y-m-d | h:i:sa", time() - 60*60*24*7*4);

        $params["conditions"] .= " AND (modified >= '$from' OR created >= '$from')";

        $response = new Response();

        $tasks = Tasks::find($params);

        $response->setStatusCode(201, "Success");

        $tasks->rewind();

        while ($tasks->valid()) {

            if ($tasks->current()->marker == "Runtime") {
                //if ($tasks->current()->task == "TeqHire Dev") {

                    $task = $tasks->current()->toArray();

                    $task['users'] = array();

                    foreach ($tasks->current()->Userbinding as $user) {
                        $task['users'][ $user->Roles->name ] = $user->Users->name;
                    }

                    $taskName = $task['task'];
                    $timestamp = date("Y.m.d", strtotime($task['modified']));

                    $pre_data["$taskName"]["taskList"]["$timestamp"]["spent"] += $task['time__spent'];

                    $pre_data["$taskName"]["taskList"]["$timestamp"]["tasks"][] = array(
                        "spent"       => $task['time__spent'],
                        "task"        => $task['task'],
                        "user"        => $task['users']['assignee'],
                        "description" => $task['description']
                    );

                //}
            }

            $tasks->next();
        }

        foreach ($pre_data as &$task) {

            $totalTime = 0;

            foreach ($task["taskList"] as $timelog) {
                $totalTime += $timelog["spent"];
            }

            $task["spentTotal"] = $totalTime;
            //echo($totalTime . "   ");
        }

        foreach ($pre_data as $taskItem => $tasklist) {

            if (count($tasklist["taskList"]) > 5) {


                $data[] = array (
                    'task' => $taskItem,
                    'tasklist' => $tasklist["taskList"],
                    'spentTotal' => $tasklist["spentTotal"]
                );
            }


        }

        $response->setJsonContent(
            array(
                'status' => 'Success',
                'data'   => $data
            )
        );

        return $response;
    }
}