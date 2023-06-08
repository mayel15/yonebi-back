const mongoose = require('mongoose');

// definition du modele de la collection "Subjects"
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },

});

// definition du modele de la collection "Category"
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: subjectSchema
})

// definition du modele de la collection "Resource"
const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    subject: subjectSchema,
    category: categorySchema,
    authors: [String],
    addedAt: { type: Date, default: Date.now },
    updatedAt: Date
});

// definition du modele de la collection "Resource"
const userAdmin = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now },
});

// creation des models à partir des schemas
const Subject = mongoose.model('Subject', subjectSchema);
const Category = mongoose.model('Category', categorySchema);
const Resource = mongoose.model('Resource', resourceSchema);
const UserAdmin = mongoose.model('UserAdmin', userAdmin);


/*const Subject = require('./model/Subject');
const Category = require('./model/Category');
const Resource = require('./model/Resource');
const UserAdmin = require('./model/UserAdmin');*/

module.exports = {
  Subject,
  Category,
  Resource,
  UserAdmin
};
