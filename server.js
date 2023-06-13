//import { Subject, Category, Resource, UserAdmin } from './model';
const { Subject, Category, Resource, UserAdmin } = require('./models');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());

// connection to the database
//mongoose.connect("mongodb://localhost:27017/yonebi")

try {
    mongoose.connect("mongodb+srv://mayel15:VI9huq6xg5tDn1qi@yonebi-cluster.0sdc2dh.mongodb.net/?retryWrites=true&w=majority")
} catch (err) {
    console.log("connection to the database failed")
}

// listening server
app.listen(process.env.PORT, () => {
    console.log(`Server Started at http://localhost:${process.env.PORT}`)
})


/**
 *  POST
 * */
// add a new resource : OK 
app.post('/api/resources/add', (req, res) => {
    var newResource, newSubject, newCategory;

    Subject.findOne({ name: req.body.subject }).then((subject) => {
        if (!subject) {
            newSubject = new Subject({ name: req.body.subject });
            newSubject.save().then(() => {
                console.log({ message: "new subject added successfully", })
            })
        } else {
            newSubject = subject;
            console.log(newSubject)
        }

        Category.findOne({ name: req.body.category }).then((category) => {
            if (!category) {
                newCategory = new Category({ name: req.body.category, subject: newSubject.name });
                newCategory.save().then(() => {
                    console.log({ message: "new category added successfully" })
                })
            } else {
                newCategory = category;
                console.log(newCategory)
            }

            Resource.findOne({ title: req.body.title })
                .then((resource) => {
                    if (process.env.PASSWORDSECURITY === req.body.passwordSecurity) {
                        if(!resource){
                            newResource = new Resource({
                                title: req.body.title,
                                description: req.body.description,
                                url: req.body.url,
                                authors: req.body.authors,
                                subject: newSubject.name,
                                category: newCategory.name

                            })
                            newResource.save().then(() => {
                                return res.send(newResource)
                            })
                        }
                        else {
                            return res.send({ message: "error :( a resource with the same name exists " })
                        }
                    }else{
                        return res.send({ message: "invalid password security" })
                    }
                }).catch(() => res.status(404).send({ message: 'error' }))

        })

    })
})

// add a user admin with a sign up : OK
app.post('/api/useradmin/signup', (req, res) => {
    UserAdmin.findOne({username: req.body.username, password: req.body.password}).then((userAdmin) => {
        if (!userAdmin && process.env.PASSWORDSECURITY === req.body.passwordSecurity){
            const newUser = new UserAdmin(req.body)
            newUser.save()
            return res.status(200).send(newUser)
        }
        else{
            return res.status(200).send({message: "error :( the user already exists"})
        }       
    })
})

// login with an account : OK
app.post('/api/useradmin/login', (req, res) => {
    UserAdmin.findOne({username: req.body.username, password: req.body.password}).then((userAdmin) => {
        return (!userAdmin)
            ? res.status(404).send({ message: "bad credentials" })
            : res.status(200).send({message: 'is connected'})          
    })
})


/**
 *  GET
 * */

// get the homepage of the server : OK
app.get('/', (req, res) => {
    res.status(200).send({ message: "Bienvenue dans le serveur de Yonebi" })
})

// get all the resource : OK
app.get('/api/resources', (req, res) => {
    Resource.find().then((resource) => {
        return (!resource)
            ? res.status(404).send({ message: "resource not found" })
            : res.status(200).send(resource)
    })
})

// get a particular resource : OK
app.get('/api/resources/:id', (req, res) => {
    Resource.findById(req.params.id).then((resource) => {
        return (!resource)
            ? res.status(404).send({ message: "resource not found" })
            : res.status(200).send(resource)
    })
})

// get the resource knowing the subject and category as parameters : OK
app.get('/api/:subject/:category/resources', (req, res) => {
    Subject.findOne({ name: req.params.subject })
        .then((subject) => {
            if (!subject) {
                return res.status(404).send('Subject not found');
            }
            Category.findOne({ name: req.params.category })
                .then((category) => {
                    if (!category) {
                        return res.status(404).send('Category not found');
                    }
                    Resource.find({ subject: subject.name, category: category.name })
                        .then((resources) => {
                            return res.send(resources);
                        })
                        .catch((error) => {
                            console.log(error);
                            return res.status(500).send('Internal server error');
                        });
                })
                .catch((error) => {
                    console.log(error);
                    return res.status(500).send('Internal server error');
                });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).send('Internal server error');
        });
});

// get a particular resource knowing the subject, category and its id as parameters : OK
app.get('/api/:subject/:category/resources/:id', (req, res) => {
    Subject.findOne({ name: req.params.subject })
        .then((subject) => {
            if (!subject) {
                return res.status(404).send('Subject not found');
            }
            Category.findOne({ name: req.params.category })
                .then((category) => {
                    if (!category) {
                        return res.status(404).send('Category not found');
                    }
                    Resource.findById(req.params.id)
                        .then((resource) => {
                            return res.send(resource);
                        })
                        .catch((error) => {
                            console.log(error);
                            return res.status(500).send('Internal server error');
                        });
                })
                .catch((error) => {
                    console.log(error);
                    return res.status(500).send('Internal server error');
                });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).send('Internal server error');
        });
})

// get the resources knowing a category as parameter
app.get('/api/:category/resources', (req, res) => {
    Category.find({name: req.params.category}).then((category_) => {
        if (!category_) {
            return res.status(404).send({ message: "category not found" })
        }
        Resource.find({ category: category_.name }).then((resource) => {
            return (!resource)
                ? res.status(400).send({ message: "resource not found" })
                : res.status(200).send(resource)
        })
    })
})

// get all the categories : OK
app.get('/api/categories', (req, res) => {
    Category.find().then((category) => {
        return (!category)
            ? res.status(404).send({ message: "category not found" })
            : res.status(200).send(category)
    })


})

// get all the categories of a subject as a parameter : NO OK a revoir 
/*app.get('/api/:subject/categories', (req, res) => {
    Subject.findOne({ name: req.params.subject }).then((subject) => {
        if (!subject) {
            return res.status(404).send({ message: "subject not found" })
        }
        Category.find({ subject: subject }).then((category) => {
            return (!category)
                ? res.status(404).send({ message: "category not found" })
                : res.status(200).send(category)
        })
    })

})*/

// get all the subjects : OK
app.get('/api/subjects', (req, res) => {
    Subject.find().then((subject) => {
        return (!subject)
            ? res.status(404).send({ message: "subject not found" })
            : res.status(200).send(subject)
    })
})

// get a particular subject with id as parameter : OK
app.get('/api/subjects/:id', (req, res) => {
    Subject.findById(req.params.id).then((subject) => {
        return (!subject)
            ? res.status(404).send({ message: "subject not found" })
            : res.status(200).send(subject)
    })
})

// get a particular category with id as parameter : OK
app.get('/api/categories/:id', (req, res) => {
    Category.findById(req.params.id).then((category) => {
        return (!category)
            ? res.status(404).send({ message: "category not found" })
            : res.status(200).send(category)
    })
})

// get all the user admin : OK
app.get('/api/useradmin', (req, res) => {
    UserAdmin.find().then((userAdmin) => {
        return (!userAdmin)
            ? res.status(404).send({ message: "user admin not found" })
            : res.status(200).send(userAdmin)
    })
})

// get a particular user admin with id as parameter : OK
app.get('/api/useradmin/:id', (req, res) => {
    UserAdmin.findById(req.params.id).then((userAdmin) => {
        return (!userAdmin)
            ? res.status(404).send({ message: "user admin not found" })
            : res.status(200).send(userAdmin)
    })
})

/**
 *  PUT
 * */

// update a particular knowing the subject, category and id as parameters : OK
app.put('/api/:subject/:category/resources/:id', (req, res) => {
    Subject.findOne({ name: req.params.subject })
        .then((subject) => {
            if (!subject) {
                return res.status(404).send('subject not found');
            }
            Category.findOne({ name: req.params.category })
                .then((category) => {
                    if (!category) {
                        return res.status(404).send('sategory not found');
                    }
                    Resource.findById(req.params.id)
                        .then((resource) => {
                            if (!resource) {
                                return res.status(404).send('resource not found')
                            }
                            else {
                                resource.title = req.body.title
                                resource.description = req.body.description
                                resource.url = req.body.url
                                resource.category = req.body.category
                                resource.subject = req.body.subject
                                resource.authors = req.body.authors
                                resource.save() 
                                return res.status(200).send({ message: "updated successfully" })
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            return res.status(404).send('Internal server error')
                        })
                })
                .catch((error) => {
                    console.log(error);
                    return res.status(404).send('Internal server error')
                })
        })
        .catch((error) => {
            console.log(error);
            return res.status(404).send('Internal server error')
        })
})

// update a particular resource knowing its id as a parameter : OK
app.put('/api/resources/:id', (req, res) => {
    var newSubject, newCategory;

    Subject.findOne({ name: req.body.subject }).then((subject) => {
        if (!subject) {
            newSubject = new Subject({ name: req.body.subject });
            newSubject.save().then(() => {
                console.log({ message: "new subject added successfully", })
            })
        } else {
            newSubject = subject;
            console.log(newSubject)
        }

        Category.findOne({ name: req.body.category }).then((category) => {
            if (!category) {
                newCategory = new Category({ name: req.body.category, subject: newSubject.name });
                newCategory.save().then(() => {
                    console.log({ message: "new category added successfully" })
                })
            } else {
                newCategory = category;
                console.log(newCategory)
            }

            Resource.findById(req.params.id).then((resource) => {
                if (!resource) {
                    return res.status(404).send({ message: "resource not found" })
                }
                else {
                    resource.title = req.body.title
                    resource.description = req.body.description
                    resource.url = req.body.url
                    resource.category = newCategory
                    resource.subject = newSubject
                    resource.authors = req.body.authors
                    resource.save()
                    return res.status(200).send({ message: "updated successfully" })
                }

            })
        })
    })

})

// update a particular category knowing its is as parameter : OK
app.put('/api/categories/:id', (req, res) => {
    Category.findById(req.params.id).then((category_) => {
        if (!category_) {
            return res.status(404).send({ message: "category not found" })
        }
        else {
            Resource.find({ category: category_.name}).then((resource)=>{
                category_.name = req.body.category
                resource.category = req.body.category
                category_.save()
                resource.save()
            })
            return res.status(200).send({ message: "updated successfully" })
        }

    })

})

// update a particular category knowing its is as parameter : OK
app.put('/api/subjects/:id', (req, res) => {
    Subject.findById(req.params.id).then((subject_) => {
        if (!subject_) {
            return res.status(404).send({ message: "subject not found" })
        }
        else {
            Category.find({ subject: subject_.name}).then((subjectCat)=>{
                Resource.find({ subject: subject_.name}).then((resource)=>{
                    subjectCat.subject = req.body.subject
                    subject_.name = req.body.subject
                    resource.subject = req.body.subject
                    subject_.save()
                    subjectCat.save()
                    resource.save()
                })
            })
            return res.status(200).send({ message: "updated successfully" })
        }

    })

})

// update a user admin with id given in parameter : OK
app.put('/api/useradmin/:id', (req, res) => {
    UserAdmin.findById(req.params.id).then((userAdmin) => {
        if (!userAdmin){
            return res.status(404).send({ message: "user admin not found" })
        }
        else{
            userAdmin.username = req.body.username
            userAdmin.password = req.body.password
            userAdmin.save()
            return  res.status(200).send({message: "updated successfully"}) 
        }    
    })
})


/**
 *  DELETE
 * */

// delete a particular subject : OK
app.delete('/api/subjects/:id', (req, res) => {
    Subject.findByIdAndDelete(req.params.id).then((subject) => {
        return (!subject)
            ? res.status(404).send({ message: "subject not found" })
            : res.status(200).send({ message: "deleted successfully" })
    })

})

// delete a particular category : OK
app.delete('/api/categories/:id', (req, res) => {
    Category.findByIdAndDelete(req.params.id).then((category) => {
        return (!category)
            ? res.status(404).send({ message: "category not found" })
            : res.status(200).send({ message: "deleted successfully" })

    })

})

/*// delete the categories knowing the subject as parameter : a revoir
app.delete('/api/:subject/categories', (req, res) => {
    Subject.findOne({name: req.params.subject}).then((subject) => {
        if (!subject) {
            return res.status(404).send({ message: "subject not found" })
        }
        Category.find({ subject: subject }).then((category) => {
            if (!category) {
                return res.status(404).send({ message: "category not found" })
            }
            else {
                Category.findByIdAndDelete(category.id)
                return res.status(200).send({ message: "deleted successfully" })
            }
        })
    })

})

// delete the resources knowing a category as parameter : a revoir
app.delete('/api/:category/resources', (req, res) => {
    Category.find({ name: req.params.category }).then((category) => {
        if (!category) {
            return res.status(404).send({ message: "category not found" })
        }
        Resource.find({ category: category }).then((resource) => {
            if (!resource) {
                return res.status(400).send({ message: "resource not found" })
            }
            else {
                resource.delete()
                return res.status(200).send({ message: "deleted successfully" })
            }
        })
    })
})*/

// delete a particumlar resource knowing its id : OK 
app.delete('/api/resources/:id', (req, res) => {
    Resource.findByIdAndDelete(req.params.id).then((resource) => {
        return (!resource)
        ? res.status(404).send({ message: "resourcee not found" })
        : res.status(200).send({ message: "deleted successfully" })
    })
})

// delete a particular user admin : OK
app.delete('/api/useradmin/:id', (req, res) => {
    UserAdmin.findByIdAndDelete(req.params.id).then((userAdmin) => {
        return (!userAdmin)
            ? res.status(404).send({ message: "user admin not found" })
            : res.status(200).send({message: `${userAdmin.username} is deleted successfully`})          
    })
})







