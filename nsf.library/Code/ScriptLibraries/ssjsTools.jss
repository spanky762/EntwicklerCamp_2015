/**	ssjsTools.js 
	============================================================
	============================================================
	ssjsTools.js
	SSJS Tools library
	http://www.learningXPages.com

	Author: Devin S. Olson		devin.olson@azlighthouse.com
	Last Updated: 09/2014
	============================================================
	============================================================
**/




function @NABvalue(key:java.lang.String, itemname:any, viewname:java.lang.String, filepath:java.lang.String, clearScope:boolean) {
/*
	@NABvalue
	Retrieves the value of an item from a document in the NAB.
	Caches the value in applicationScope. 
	If the requested value exists in applicationScope returns that value. Otherwise a lookup to the NAB will be performed.  
	By default lookups are performed using the ($VIMPEOPLE) view.  
	
	@param key: Key to use when looking up content.
	@param itemname: String or int.  Name of item (or column number) to return.
	@param viewname: Name of view to use for lookups.  [optional]
	@param filepath: Filepath for NAB to use.  [optional]
	@param clearScope: Flag indicating if the scope variable should be cleared first.  This forces a lookup.  [OPTIONAL}
	
	@return: Result of the lookup.  Empty string on error.
*/
	if (@IsBlank(key) || @IsBlank(itemname)) { return ""; }
	viewname = (@IsBlank(viewname))? "($VIMPEOPLE)": viewname;
	filepath = (@IsBlank(filepath))? "names.nsf": filepath;
	
	var chunks:Array = new Array(key, itemname.toString(), viewname, filepath); 
	var tag:java.lang.String = chunks.join(getDefaultDelimiter());
	if (applicationScope.containsKey(tag)) { 
		if (!clearScope) { 
			return applicationScope.get(tag);
		} else {
			applicationScope.remove(tag); 
		} 		
	} 
	
	var result = @DbLookup(["", filepath], viewname, key, itemname, "[FailSilent]"); 
	applicationScope.put(tag, result);
	
	return result;
} 

function getUserRoles() { 
/*
	getUserRoles
	Gets the User Roles in place for the current user.
	
	@return: Array containing the roles for the current user .  Empty string on error.
*/
	var name:java.lang.String = getUserName();
	var tag:java.lang.String = name + ".roles";
	if (sessionScope.containsKey(tag)) { return sessionScope.get(tag); }
	
	var roles = context.getUser().getRoles().toArray();
	var result = (roles.length > 0)? roles: "";
	sessionScope.put(tag, result);
	
	return result;
} 


function getUserNameCommon(arg0:java.lang.String) {
/*
	getUserName
	Gets the name in a Common format.
	Uses the Current User if no name specified.
	
	@return: Common form of user name.  Empty string on error.
*/	
	var name = getUserName(arg0); 
	var tag:java.lang.String = name + ".common";
	if (sessionScope.containsKey(tag)) { return sessionScope.get(tag); }

	var result = @Name("[CN]", name);
	sessionScope.put(tag, result);
	
	return result;
} 


function getUserNameAbbreviated(arg0:java.lang.String) {
/*
	getUserNameAbbreviated
	Gets the name in a Abbreviated format.
	Uses the Current User if no name specified.
	
	@return: Abbreviated form of user name.  Empty string on error.
*/		
	var name = getUserName(arg0); 
	var tag:java.lang.String = name + ".abbreviated";
	if (sessionScope.containsKey(tag)) { return sessionScope.get(tag); }

	var result = @Name("[Abbreviate]", name);
	sessionScope.put(tag, result);
	
	return result;
} 


function getUserNameAbbrevCNOUonly(arg0:java.lang.String) {
	var abbrev = (@IsBlank(arg0))? getUserNameAbbreviated(): arg0;
	var key = "cnouonly." + abbrev.toLowerCase(); 
	if (applicationScope.containsKey(key)) { return applicationScope.get(key); } 
	
	if (abbrev.indexOf("/") < 1) { abbrev = getUserNameAbbreviated(); } 
	var chunks = abbrev.split("/");
	chunks.length = (chunks.length > 1)? chunks.length - 1: chunks.length;
	var result = chunks.join("/");
	applicationScope.put(key, result);
	
	return result;
} 


function getUserName(arg0:java.lang.String) {
/*
	getUserName
	Gets the name in a Canonicalized format.
	Uses the Current User if no name specified.
	
	@return: Canonicalized form of user name.  Empty string on error.
*/	
	return (@IsBlank(arg0))? context.getUser().getDistinguishedName(): @Name("[CANONICALIZE]", arg0);
} 


function @IsBlank(source:java.lang.String):boolean {
/*
	@IsBlank
	Tests a string to determine if it is blank.
	
	@param source: string to test.
	@return: Flag indicating if the string is blank.
	
*/
	try {
		return ((!source) || (0 === @Length(@Trim(source))));
	} catch(err) { 
		print("*");
		print("*");
		print("*");
		print("*");
		print("*");
		print("*");
		print("EXCEPTION in ssjsTools.@IsBlank");
		print(err);
		return true;
	}
}


function getDefaultDelimiter():java.lang.String {
	return "Ø"; // <ALT> + 0216 from numeric keypad 
} 


function isNumeric(obj:any):boolean {
/*
	isNumeric
	Determines if a variable is numeric.
	
	@param obj: variable to test
	@return: Flag indicating if the object is numeric
	@see: http://www.devinolson.net/devin/SpankysPlace.nsf/d6plinks/DOLN-7RTGYY
*/
	try {
		return (((obj - 0) == obj) && (obj.length > 0));
	} catch (e) {
		return false;
	}
} 


function isArray(obj):boolean {
/*
	isArray
	Determines if a variable is an array.
	
	@param obj: variable to test
	@return: Flag indicating if the object is an array
	@see: http://www.devinolson.net/devin/SpankysPlace.nsf/d6plinks/DOLN-7RTGYY
*/
	if (!obj) { return false; }
	try {
		if (!(obj.propertyIsEnumerable("length")) && 
		(typeof obj === "object") && 
		(typeof obj.length === "number")) {
			for (var idx in obj) {
				if (!isNumeric(idx)) { return false; }
			} 
			
			return true;
			
		} else {
			return false;
		} 
		
	} catch (e) {
		return false;
	}
} 



function clearMap(map:Map, keypattern:java.lang.String):boolean {
/*
	clearMap
	Clears elements from a map.
	
	@param map: The map for which to clear elements.
	@param keypattern: RegEx pattern to match keys. 
		If exists then only elements matching this pattern will be cleared. [optional]
		Examples:
		clearMap(sessionScope, "^foo"); // Clear all elements from sessionScope whose tags begin with "foo".
		clearMap(viewScope); // Clear all elements from viewScope
		clearMap(applicationscope, "bar$"); // Clear all elements from applicationScope whose tags end with "bar".
		
	@return: Flag indicating if the map was successfully cleared.
*/
	if (map == null) { return false; }
	if (@IsBlank(keypattern)) { 
		// clear the entire map
		try {
			var iterator:Iterator = map.keySet().iterator();
			while (iterator.hasNext()) {
				map.remove(iterator.next());
			} // while (iterator.hasNext())		
		} catch (e) {
			print("EXCEPTION in ssjsTools.clearMap()");
			print(e.name);
			print(e.message);
			print(e.stack);
			return false;
		}
		
		return true;
		
	} else {
		// search for patterns to clear
		var regex:RegExp = new RegExp(keypattern);
		var keys:Array = new Array();  // container for matched keys
		var iterator:Iterator = map.keySet().iterator();
		while (iterator.hasNext()) {
			var entry:Map.Entry = iterator.next();
			if (regex.test(entry)) { 
				keys.push(entry); }
		}
		
		var result:boolean = false;
		
		for (var i=0; i<keys.length; i++) { 
			map.remove(keys[i]); 
			result = true;
		} 
		
		return result;
	} 
}



function getTimeStamp():java.lang.String {
/*
	getTimeStamp
	Gets a standard timestamp string for the current time.	
	@return: Standard timestamp string for the current time.
*/
	var pattern:java.lang.String = "yyyyMMddHHmmssz";
	return DateConverter.dateToString(@Now(), pattern);
} 


function strReplaceSubstring(source, searchfor, replacewith):java.lang.String {
/*
	strReplaceSubstring
	Replaces all instances of a substring in a string with another substring.	
	
	@param source: String within which to search.
	@param searchfor: Substring to search for.
	@param replacewith: Substring to replace all instances of searchfor.
	@return: String with instances replaced.
*/
	return (@IsBlank(source))? "": source.split(searchfor).join(replacewith);
} 





/**	BEGIN BEGIN BEGIN BEGIN BEGIN BEGIN BEGIN BEGIN BEGIN BEGIN 
	============================================================
	DATE CONVERSION FUNCTIONS

	Author: Tommy Valand		http://www.dontpanic82.com, http://plus.google.com/109083546111451101200
	Last Updated: 04/2010
	URL: http://dontpanic82.blogspot.com/2010/04/xpages-code-snippet-for-datestring.html
	============================================================
**/
var DateConverter = {
	dateToString: function(date:java.util.Date, pattern:java.lang.String) {
			if (!date) { return ""; }
				
			var formatter = DateConverter.getFormatter(pattern);
			return formatter.format(date);
	}, 
	
	stringToDate: function(dateString:java.lang.String, pattern:java.lang.String) {
			if (!dateString) { return null; }
			
			var formatter = DateConverter.getFormatter(pattern);
			return formatter.parse(dateString);
	}, 
	
	getFormatter: function(pattern:java.lang.String) {
			var cacheKey = "dateFormatter" + pattern;
			var dateFormatter = applicationScope.get(cacheKey);
			if (!dateFormatter) {
				dateFormatter = new java.text.SimpleDateFormat(pattern);
				applicationScope.put(cacheKey, dateFormatter);
			} 
			
			return dateFormatter;
	} 
} 


/**	END END END END END END END END END END END END END END END  
	============================================================
	DATE CONVERSION FUNCTIONS
	============================================================
**/ 


function VectorToArray(arg0:java.util.Vector):Array {
/*
	VectorToArray
	Disassociates a Vector from its content.
	
	@param arg0: Vector object
	@return: AReturns an array containing all of the elements in this Vector in the correct order.
*/	
	if (arg0 == null) { return new Array(0); }
	return arg0.toArray()
	
} 


function VectorToStringArray(arg0:java.util.Vector):Array {
/*
	VectorToStringArray
	Disassociates a Vector from its content.
	
	@param arg0: Vector object whose elements are Strings
	@return: AReturns an array containing all of the elements in this Vector in the correct order.
*/	
	if (arg0 == null) { return new Array(""); }
	if (typeof arg0 === "string" ) { return new Array(arg0); }

	var result:Array = new Array(arg0.size());
	var temp = VectorToArray(arg0);
	
	for (var i=0; i<temp.length; i++) {
		result[i] = @Text(temp[i]);
	}
	
	return result;
} 


function getScopeMap(tag, variableID) {
	tag = @Trim(@Text(tag)).toLowerCase();
	if (@IsBlank(tag)) { tag = "view"; }

	if ("view".equalsIgnoreCase(tag)) { return viewScope; }
	if ("session".equalsIgnoreCase(tag)) { return sessionScope; }
	if ("application".equalsIgnoreCase(tag)) { return applicationScope; }
	if ("request".equalsIgnoreCase(tag)) { return requestScope; }
	
	print("*");
	print("UNKNOWN SCOPE EXCEPTION in ssjsTools.getScopeMap()");
	print("Requested Scope:" + tag);
	print("Requested Variable:" + variableID);
	print("*");
	
	return null;
} 


function getScopeVariable(tagScope, tagVariable) {
	tagScope = @Trim(@Text(tagScope)).toLowerCase();
	if (@IsBlank(tagScope)) { tagScope = "view"; }
	var map = getScopeMap(tagScope);
	if (null == map) { return null; } 
	
	key = @Trim(@Text(tagVariable)).toLowerCase();
	if (@IsBlank(key)) { return null; } 

	return (map.containsKey(key))? map.get(key): null; 
	
	print("*");
	print("UNKNOWN SCOPE EXCEPTION in ssjsTools.getScopeVariable()");
	print("Requested Scope:" + tagScope);
	print("Variable Name:" + tagVariable);
	print("*");
	
	return null;
} 


function putScopeVariable(tagScope, tagVariable, value) {
	tagScope = @Trim(@Text(tagScope)).toLowerCase();
	if (@IsBlank(tagScope)) { tagScope = "view"; }
	var map = getScopeMap(tagScope);
	if (null == map) { return null; } 
	
	key = @Trim(@Text(tagVariable)).toLowerCase();
	if (@IsBlank(key)) { return null; } 
	
	return map.put(key, value); 
	
	print("*");
	print("UNKNOWN SCOPE EXCEPTION in ssjsTools.putScopeVariable()");
	print("Requested Scope:" + tagScope);
	print("Variable Name:" + tagVariable);
	print("*");
	
	return null;
} 


function clearScopeVariable(tagScope, tagVariable) {
	tagScope = @Trim(@Text(tagScope)).toLowerCase();
	if (@IsBlank(tagScope)) { tagScope = "view"; }
	var map = getScopeMap(tagScope);
	if (null == map) { return null; } 
	
	key = @Trim(@Text(tagVariable)).toLowerCase();
	if (@IsBlank(key)) { return null; } 
	
	return map.remove(key);
	
	print("*");
	print("UNKNOWN SCOPE EXCEPTION in ssjsTools.clearScopeVariable()");
	print("Requested Scope:" + tagScope);
	print("Variable Name:" + tagVariable);
	print("*");
	
	return null;
} 


function getProtocol() {
	//Get the protocol portion of the URL.  i.e. http, http, ftp, etc.
	var xUrl:XSPUrl = context.getUrl(); 
	var url:java.lang.String = xUrl.getAddress();  //url = full link

	var chunks = url.split(":");
	return chunks[0] + "://";
} 


function getBaseURL(path:string) {
	 var curURL = context.getUrl();
	 var curAdr = curURL.getAddress();
	 var rel = curURL.getSiteRelativeAddress(context);
	 var step1 = curAdr.substr(0,curAdr.indexOf(rel));

	 // Now cut off the http
	 var step2 = step1.substr(step1.indexOf("//")+2);
	 var result = step2.substr(step2.indexOf("/"));
	 return result;
} 



function checkDisableMSIEcompatibilityView() { 
	// Force MSIE Compatibility Mode to be disabled
	if (context.getUserAgent().isIE()) {
		var externalContext = facesContext.getExternalContext();
		var response = externalContext.getResponse();
		response.setHeader("X-UA-Compatible", "IE=edge, chrome=1");
	} 
} 





