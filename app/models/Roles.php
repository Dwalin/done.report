<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Roles extends Model
{
    public $id;
    public $name;

    public function initialize()
    {

        $this->hasMany(
            "id",
            "Userbinding",
            "role_id"
        );


    }

}
