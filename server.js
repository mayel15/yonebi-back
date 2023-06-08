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
    console.log(err)
}

// listening server
app.listen(process.env.PORT, () => {
    console.log(`Server Started at http://localhost:${process.env.PORT}`)
})



// POST
// add a new resource
app.post('/api/resources/add', (req, res) => {
    var newResource, newSubject, newCategory;

    Subject.findOne({ name: req.body.subject }).then((s) => {
        if (!s) {
            newSubject = new Subject({ name: req.body.subject });
            newSubject.save().then(() => {
                console.log({ message: "new subject added successfully", })
            })
        } else {
            newSubject = s;
        }
    })

    Category.findOne({ name: req.body.category }).then((c) => {
        if (!c) {
            newCategory = new Category({ name: req.body.category, newSubject });
            newCategory.save().then(() => {
                console.log({ message: "new category added successfully" })
            })
        } else {
            newCategory = c;
        }
    })

    Resource.findOne({ title: req.body.title })
        .then((r) => {
            if (!r) {
                newResource = new Resource({
                    title: req.body.title,
                    description: req.body.description,
                    url: req.body.url,
                    authors: req.body.authors,
                    category: newCategory,
                    subject: newSubject
                })
                newResource.save().then(() => {
                    res.send({ message: "added successfully", newResource })
                })
            }
            else {
                res.send({ message: "error :( a resource with the same name exists " })
            }
        }).catch(() => res.status(404).send({ message: 'error' }))
})

/*app.post('/api/categories/add', (req, res) => {
    Resource.findOne({ name: req.body.name })
        .then((c) => {
            if (!c) {
                const category = new Resource(req.body)
                resource.save().then(()=>{
                    res.send({message: "added successfully", category})
                })
            }
            else {
                res.send({message: "error :( a category with the same name exists "}) 
            }
        }).catch(()=> res.status(404).send({message: 'error'}))
})

app.post('/api/subjects/add', (req, res) => {
    Resource.findOne({ name: req.body.name })
        .then((s) => {
            if (!s) {
                const subject = new Subject(req.body)
                subject.save().then(()=>{
                    res.send({message: "added successfully", subject})
                })
            }
            else {
                res.send({message: "error :( a subject with the same name exists"}) 
            }
        }).catch(()=> res.status(404).send({message: 'error'}))
})*/


// GET  
// get the homepaage of the server
app.get('/', (req, res) => {
    res.status(200).send({ message: "Bienvenue dans le serveur de Yonebi" })
})

// get all the resource
app.get('/api/resources', (req, res) => {
    Resource.find().then((resource) => {
        return (!resource) 
        ? res.status(404).send({message: "resource not found"}) 
        : res.status(200).send(resource)  
    })
})

// get a particular resource
app.get('/api/resources/:id', (req, res) => {
    Resource.findById(req.params.id).then((r) => {
        return (!resource) 
        ? res.status(404).send({message: "resource not found"}) 
        : res.status(200).send(resource) 
    })
})

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
                    Resource.find({ subject: subject, category: category })
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

// get the resources per category
app.get('/api/:category/resources', (req, res) => {
    Resource.find({
        category: req.params.category,
    }).then((r) => {
        res.send(r)
    })
})

// get all the categories
app.get('/api/categories', (req, res) => {
    Category.find().then((category) =>{
        return (!category) 
        ? res.status(404).send({message: "category not found"}) 
        : res.status(200).send(category) 
    })
    
    
})

app.get('/api/:subject/categories', (req, res) => {
    Category.find({
        subject: req.params.subject.name,
    }).then((c) => {
        res.send(c)
    })
})


app.get('/api/subjects', (req, res) => {
    Subject.find().then((s) =>
        res.status(200).send(s)
    )
})



app.get('/api/subjects/:id', (req, res) => {
    Subject.findById(req.params.id).then((subject) => {
        if (!subject) {
            return res.status(404).send({ message: "category not found" })
        }
        else {
            res.status(200).send(subject)
        }
    })
})


app.get('/api/category/:id', (req, res) => {
    Category.findById(req.params.id).then((category) => {
        if (!category) {
            return res.status(404).send({ message: "category not found" })
        }
        else {
            res.status(200).send(category)
        }
    })
})

app.get('/api/resources/:id', (req, res) => {
    Subject.findById(req.params.id).then((resource) => {
        if (!resource) {
            return res.status(404).send({ message: "category not found" })
        }
        else {
            res.status(200).send(resource)
        }
    })
})

// PUT
app.put('/api/:subject/:category/resources/:id', (req, res) => {
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
                            if (!resource) {
                                return res.status(404).send('Resource not found')
                            }
                            else {
                                resource.title = req.body.title
                                resource.description = req.body.description
                                resource.url = req.body.url
                                resource.category = req.body.category
                                resource.subject = req.body.subject
                                resource.authors = req.body.authors
                                resource.save()
                                return res.status(200).send(resource)
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

app.put('/api/resources/:id', (req, res) => {
    Resource.findById(req.params.id).then((resource) => {
        if (!resource) {
            return res.send(404).send({ message: "resource not found" })
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

})

app.put('/api/categories/:id', (req, res) => {
    Category.findById(req.params.id).then((category) => {
        if (!category) {
            return res.send(404).send({ message: "subject not found" })
        }
        else {
            category.name = req.body.category
            category.save()
            return res.status(200).send({ message: "updated successfully" })
        }

    })

})


app.put('/api/subjects/:id', (req, res) => {
    Subject.findByIdAndDelete(req.params.id).then((subject) => {
        if (!subject) {
            return res.send(404).send({ message: "subject not found" })
        }
        else {
            subject.name = req.body.subject
            subject.save()
            return res.status(200).send({ message: "deleted successfully" })
        }

    })

})

// DELETE 
app.delete('/api/subjects/:id', (req, res) => {
    Subject.findByIdAndDelete(req.params.id).then((subject) => {
        if (!subject) {
            return res.send(404).send({ message: "subject not found" })
        }
        else {
            return res.status(200).send({ message: "deleted successfully" })
        }

    })

})

app.delete('/api/categories/:id', (req, res) => {
    SubCategoryject.findByIdAndDelete(req.params.id).then((category) => {
        if (!category) {
            return res.send(404).send({ message: "category not found" })
        }
        else {
            return res.status(200).send({ message: "deleted successfully" })
        }

    })

})

app.delete('/api/subjects/categories', (req, res) => {
    Subject.findByIdAndDelete(req.params.id).then((subject) => {
        if (!subject) {
            return res.send(404).send({ message: "subject not found" })
        }

        Category.find({ subject: subject }).then((category) => {
            if (!category) {
                return res.send(404).send({ message: "category not found" })
            }
            else {
                category.delete()
                return res.status(200).send({ message: "deleted successfully" })
            }
        })
    })

})

app.delete('/api/resources/:id', (req, res) => {
    Resource.findByIdAndDelete(req.params.id).then((resource) => {
        if (!resource) {
            return res.send(404).send({ message: "resource not found" })
        }
        else {
            return res.status(200).send({ message: "deleted successfully" })
        }

    })

})







