<?php

/*use Phalcon\Loader;
//use Phalcon\Mvc\Micro;
use Phalcon\Mvc\View;
//use Phalcon\Mvc\Micro\Collection;
//use Phalcon\Mvc\User\Plugin;
//use Phalcon\Mvc\Dispatcher;
use Phalcon\Mvc\Controller;
use Phalcon\Mvc\Application;
//use Phalcon\Mvc\Router;
use Phalcon\Di\FactoryDefault;
//use Phalcon\Events\Manager;
use Phalcon\Db\Adapter\Pdo\Mysql as PdoMysql;
use Phalcon\Http\Response;
use Phalcon\Http\Request;
use Phalcon\Security;
//use Phalcon\Session\Adapter\Files as Session;*/

use Phalcon\Loader;
use Phalcon\Mvc\View;
use Phalcon\Mvc\Application;
use Phalcon\Di\FactoryDefault;
use Phalcon\Mvc\Url as UrlProvider;
use Phalcon\Db\Adapter\Pdo\Mysql as DbAdapter;


// Используем Loader() для автозагрузки нашей модели
$loader = new Loader();
$loader->registerDirs(array(
                          __DIR__ . '/controllers/',
                          __DIR__ . '/models/'
                      ))->register();

$di = new FactoryDefault();

// Настраиваем компонент View
$di->set('view', function () {
    $view = new View();
    $view->setViewsDir('../app/views/');
    return $view;
});

$di->setShared('session', function () {
    $session = new Session();
    $session->start();
    return $session;
});

// Настраиваем сервис базы данных
$di->set('db', function () {
    return new PdoMysql(
        array(
            "host"     => "kryzhani.mysql.ukraine.com.ua",
            "username" => "kryzhani_task",
            "password" => "2htq8lph",
            "dbname"   => "kryzhani_task",
            "options" => array(
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
            )
        )
    );
});

$application = new Application($di);
echo $application->handle()->getContent();



/*// Создаем и привязываем DI к приложению
$app = new Micro($di);

// Получение всех тасков
    $app->get('/api/tasks', function() use($app) {

        // Create a response
        $response = new Response();
        $tasks = Tasks::find();


        if ($tasks->count() > 0) {
            $response->setStatusCode(201, "Success");


            $tasks->rewind();

            while ($tasks->valid()) {
                $task = $tasks->current()->toArray();
                $task['tags'] = $tasks->current()->Tags->toArray();


                foreach ($tasks->current()->Userbinding as $user) {
                    $task['users'][] = array(
                        'role' => $user->Roles->name,
                        'user' => $user->Users->name
                    );
                }
                $data[] = $task;
                $tasks->next();
            }

            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'data'   => $data
                )
            );

        } else {

            // Change the HTTP status
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status'   => 'No tasks found'
                )
            );
        }

        return $response;

    });

// Получение таска по номеру
    $app->get('/api/tasks/{id:[0-9]+}', function ($id) use($app) {

        // Create a response
        $response = new Response();

        $task = Tasks::find(
            array (
                "id = $id"
            )
        );


        if ($task->count() > 0) {
            $response->setStatusCode(201, "Success");

            $task = $task->toArray();
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'found',
                    'data'   => $task
                )
            );

        } else {

            // Change the HTTP status
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status'   => 'Not found any task'
                )
            );
        }

        return $response;

    });

// Получение всех тасков в определенном состоянии
    $app->get('/api/tasks/state/{state}', function($state) use($app) {

        // Create a response
        $response = new Response();

        $tasks = Tasks::find (
            array (
                "state = '$state'"
            )
        );

        if ($tasks->count() > 0) {
            $response->setStatusCode(201, "Success");

            $tasks->rewind();
            while ($tasks->valid()) {
                $data[] = $tasks->current()->toArray();
                $tasks->next();
            }

            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'found',
                    'count' => $tasks->count(),
                    'data'   => $data
                )
            );

        } else {

            // Change the HTTP status
            $response->setStatusCode(404, "Not found");
            $response->setJsonContent(
                array(
                    'status'   => 'Not found any tasks'
                )
            );
        }

        return $response;

    });

// Создание таска
    $app->post('/api/tasks', function () use ($app) {

        $request = $app->request->getJsonRawBody();

        // Create a response
        $response = new Response();

        $task = new Tasks();

        $task->task = $request->task;
        $task->description = $request->description;
        $task->assigned__by = $request->assigned__by;
        $task->assigned__to = $request->assigned__to;
        $task->tester = $request->tester;
        $task->deadline = $request->deadline;
        $task->ticket = $request->ticket;
        $task->state = $request->state;
        $task->time__spent = $request->time__spent;
        $task->tags = $request->tags;

        if ( $task->create() != false) {

            $response->setStatusCode(201, "Success");

            $task = $task->toArray();
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'data'   => $task
                )
            );

        } else {

            // Change the HTTP status
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

        return $response;

    });

// Установка роли пользователя
    $app->put('/api/tasks/{id:[0-9]+}/role/{role:[0-9]+}/user/{user:[0-9]+}', function ($id, $role, $user) use ($app) {

        // Create a response
        $response = new Response();

        $role = Userbinding::findFirst(
            array(
                "role = '$role'",
                "task_id = '$id'"
            )
        );

        if (count($role) == 1) {
            $role->user_id = $user;

            if ($role->update() == false) {

                // Send errors to the client
                $errors = array();
                foreach ($role->getMessages() as $message) {
                    $errors[] = $message->getMessage();
                }

                $response->setJsonContent(
                    array(
                        'status'   => 'ERROR',
                        'messages' => $errors
                    )
                );


            } else {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status'   => 'Updated task number '. $id . ', setted the role of ' . $role->Roles->name . ' to ' . $role->Users->name,
                        'data'   => $role->Tasks->toArray()
                    )
                );

            }

        } else {
            $role = new Userbinding();
            $role->task_id = $id;
            $role->role = $role;
            $role->user_id = $user;

            if ($role->create() == false) {

                // Send errors to the client
                $errors = array();
                foreach ($role->getMessages() as $message) {
                    $errors[] = $message->getMessage();
                }

                $response->setJsonContent(
                    array(
                        'status'   => 'ERROR',
                        'messages' => $errors
                    )
                );

            } else {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status'   => 'Updated task number '. $id,
                        'data'   => $role->Tasks->toArray()
                    )
                );

            }


        }

        return $response;

    });

// Обновление таска
    $app->put('/api/tasks/{id:[0-9]+}', function ($id) use ($app) {

        $request = $app->request->getRawBody();

        // Create a response
        $response = new Response();

        $task = Tasks::find(
            array (
                "id = $id"
            )
        );

        $request = json_decode($request, true);

        //print_r($request);
        //die();

        if ( $task->update($request) != false) {

            $response->setStatusCode(201, "Success");

            $task = $task->toArray();
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'modified',
                    'data'   => $task
                )
            );

        } else {

            // Change the HTTP status
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

        return $response;
    });

// Удаление таска
    $app->delete('/api/tasks/{id:[0-9]+}', function ($id) use ($app) {

        $request = $app->request->getRawBody();

        // Create a response
        $response = new Response();

        $task = Tasks::find(
            array (
                "id = $id"
            )
        );


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
                // Change the HTTP status
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
        }

        return $response;
    });

// Получение всех юзеров
    $app->get('/api/users', function () use ($app) {

        // Create a response
        $response = new Response();

        $users = Users::find(array("columns" => "name, email"));

        if (count($users) > 0) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'found',
                    'data'   => $users->toArray()
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($users->getMessages() as $message) {
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

    });


// Создание юзера
$app->post('/api/users/new', function () use ($app) {

    $request = $_POST;
    // Create a response
    $response = new Response();

    $user = new Users;

    $user->email = $app->request->getPost('email');
    $user->name = $app->request->getPost('name');
    $user->password = $app->security->hash( $app->request->getPost('password'));


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

});

// Логин
$app->post('/api/users/login', function () use ($app) {

    // Create a response
    $response = new Response();


    $name    = $app->request->getPost('name');
    $password = $app->request->getPost('password');

    $user = Users::findFirstByName($name);

    if ($user) {
        if ($app->security->checkHash($password, $user->password)) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'logged',
                    'data'   => $user
                )
            );

            //var_dump($_COOKIE);

            setcookie("task", $user->toArray());
            $app->session->set("task", $user->toArray());

            //var_dump ($app->session->get("user-name"));

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
        $response->setStatusCode(409, "Conflict");

        // Send errors to the client
        $response->setJsonContent(
            array(
                'status'   => 'NO SUCH USER',
            )
        );
    }

    return $response;

});*/


/*echo $app->handle();*/





//if (isset ($app->session->get("task")['name']) ) {
?>