'use strict';
var app = angular.module('phone', ['LocalStorageModule', 'ngRoute']);
  
app.config(['$routeProvider' ,'localStorageServiceProvider',
  function($routeProvider, localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('phoneApp');
    $routeProvider.
      when('/insert/:id?', {
        templateUrl: 'template/insert.html',
        controller: 'insertController'
      }).
      when('/sud', {
        templateUrl: 'template/Srch-Up-Del.html',
        controller: 'SUDController'
      }); /*.
      otherwise({
        redirectTo: '/insert'
      });*/
}]);

/**
 * this factory acts as our database!
 */
app.factory('clientDataService', function(localStorageService){
    this.contacts = [];
    this.uid ;
    
	// loads all contacts from local storage
	this.getAllContacts = function() {
		//localStorageService.clearAll();
		var all = localStorageService.get('contacts');
		//clones the result and updates
		this.contacts = JSON.parse(JSON.stringify(all));
		
		return all;
	};
	
	this.getLatestUid = function(all) {
		
		/**
		 * storage is empty
		 */
		if (all === null)
			return 0;
		
		/**
		 * looking for latest uid
		 */
		var max = all[0].id;
		for ( var i=0; i< all.length; i++)
			if (all[i].id > max) {
				max = all[i].id;
			}
		
		return max;
		
	}
	
	/**
	 * saves the contact
	 */
	this.saveContact = function(contactObject) {
		var all = this.getAllContacts();
		
		// loads latest uid
		this.uid = this.getLatestUid(all);
		
		if (all === null || all === []) {
			contactObject.id = this.uid;
			all = [contactObject];
		} else {
			this.uid = this.uid + 1;
			contactObject.id = this.uid;
			all.push(contactObject);
		}
	
		var result = localStorageService.set('contacts', JSON.stringify(all));
		
		this.contacts = all;
		
		return result;
		
	};
	
	/**
	 * removes the contact and update local storage
	 */
	this.removeContact = function(contactId) {
		for( var i=0; i< this.contacts.length; i++)
			if (contactId === this.contacts[i].id) {				
				if (this.contacts.length === 1)
					this.contacts = [];
				else 
					this.contacts.splice(i, 1);
				
				localStorageService.set('contacts', JSON.stringify(this.contacts));
				this.contacts = JSON.parse(JSON.stringify(this.contacts));
				
				break;
			}
		return this.contacts;
	};
	
	return this;
});

/**
 * this method adds a new contact 
 * @param clientDataService is the factory which saves the record
 */
app.controller('insertController', function($scope, clientDataService, $routeParams) {
	
	$scope.contacts = clientDataService.getAllContacts();
	
	/**
	 * saves the contact and update the form if necessary
	 */
	$scope.saveContact = function() {
		$scope.message = clientDataService.saveContact($scope.contact) ? 'data saved' : 'there was an error';
		if ($scope.isUpdate)
			return;
		//$scope.contact = {};//this clears the form when it's a new contact
		window.location.reload(false); //refresh the page
	};
	
	/*
	 * sets 'contact' when contact's Id defined in the route
	 */
	if (typeof($routeParams.id) === 'undefined') {
		$scope.isUpdate = false;
	    $scope.title = 'add a new contact';
		return;
	} 
	
	$scope.title = 'update contact';
	/*
	 * used in saveContact function to see if the form should get clear or not
	 */
	$scope.isUpdate = true;
	console.log(parseInt($routeParams.id));
	console.log($scope.contacts[0].id);
	/*
	 * this is an update request
	 */
	 for( var i=0; i< $scope.contacts.length; i++)
			if (parseInt($routeParams.id) === $scope.contacts[i].id) {	
				$scope.contact = { };		
				$scope.contact.id = $scope.contacts[i].id;
				$scope.contact.name = $scope.contacts[i].name;
				$scope.contact.phone = $scope.contacts[i].phone;
				$scope.contact.email = $scope.contacts[i].email;
				
				break;
			}
	 	
});
 
/**
 * search and delete controller
 */
app.controller('SUDController', function($scope, clientDataService) {
    $scope.title = 'Search Contacts';
    $scope.contacts = clientDataService.getAllContacts();
    
    /*
     * removes a contact by it's id
     */
    $scope.remove = function(id) {
		$scope.contacts = clientDataService.removeContact(id);
	};
	
});


