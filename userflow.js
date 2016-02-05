if (Meteor.isClient) {

  $.validator.setDefaults({
    rules: {
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minlength: 6
      },
      username: {
        required: true,
        minlength: 4
      },
      phone: {
        digits: true,
        maxlength: 10,
        minlength: 10
      },
      state: {
        minlength: 2,
        maxlength: 2
      },
      zip: {
        digits: true,
        minlength: 5,
        maxlength: 5
      }
    }
  });

  Template.register.onRendered(function() {
    var validator = $('.register').validate({
      submitHandler: function(event) {
        var email = $('[name=email]').val();
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();
        var firstname = $('[name=first]').val();
        var lastname = $('[name=last]').val();
        var street = $('[name=street]').val();
        var city = $('[name=city]').val();
        var state = $('[name=state]').val();
        var zip = $('[name=zip]').val();
        var phone = $('[name=phone]').val();
        var address = {street, city, state, zip};
        var name = {firstname, lastname};

        console.log('attempting to create new user');
        try {
          Accounts.createUser({
            username,
            email, 
            password,
            name, 
            phone,
            address,
            function(err) {
              if (err) {
                console.log('ERR ', err);
                if (err.reason == "Email already exists.") {
                  validator.showErrors({
                    email: "That email already belongs to a registered user."   
                  });
                }
              }
            }
          });
        } catch(e) {
          alert('there was an error');
        }
      }
    });
  });

  Template.login.onRendered(function() {
    var validator = $('.login').validate({
      submitHandler: function(event) {
        var loginEmail = $('#email').val();
        var loginPassword = $('#password').val();
        
        console.log('email ' + loginEmail);
        console.log('password ' + loginPassword);

        Meteor.loginWithPassword(
          loginEmail, 
          loginPassword, 
          function(err) {
            if (err) {
              if (err.reason == 'User not found' || err.reason == 'Match failed') {
                validator.showErrors({
                  email: err.reason
                });
              }
              if (err.reason == 'Incorrect password') {
                validator.showErrors({
                  password: err.reason
                });
              }
            }
          }
        );
      }
    });
  });

  Template.update.events({
    'click .updatePassword': function(event) {
      var oldPass = $('[name=oldPassword]').val();
      var newPass = $('[name=newPassword]').val();

      Accounts.changePassword(oldPass, newPass, function(err){
        if (err) {
          alert('Error, request failed');
        } else {
          alert('Password suffessfully changed');
        }
        $('.sensitive').val('');
      });
    },

    'click .updateUsername': function(event) {
      var newUsername = $('[name=newUsername]').val();
      var user = Meteor.user();

      console.dir(Meteor.user());

      try {
        Meteor.call('updateUsername', user._id, newUsername, function(err) {
          alert('username changed successfully');
        });
      } catch(err) {
        alert('There was an error');
        console.log(err);
      }
    }
  });

  Template.loggedIn.helpers({
    getUsername: function() {
      return Meteor.user().username;
    }
  })

  Template.logout.events({
    'click button': function(event) {
      event.preventDefault();
      Meteor.logout();
    }
  });

  Template.deleteAccount.events({
    'click button': function(event) {
      event.preventDefault();
      Meteor.call('removeUser', Meteor.user()._id);
    }
  });
}

if (Meteor.isServer) {
  Meteor.users.allow({
    remove:function() { 
      return true;
    } 
  });

  Meteor.methods({
    updateUsername: function(id, newName){
      Accounts.setUsername(id, newName);
    },

    removeUser: function(id) {
      console.log('attempting to remove user id' + id);
      Meteor.users.remove({ _id: id }, function (error, result) {
        if (error) {
          console.log("Error removing user: ", error);
        } else {
          console.log("Number of users removed: " + result);
        }
      });
    }
  });
}
