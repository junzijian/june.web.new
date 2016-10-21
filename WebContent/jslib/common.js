//共同取得一览数据的方法
function commonGetrowdatas(gridid, data, url, success, boolean) {
	if (boolean) {
		var options = $('#' + gridid).bootstrapTable('getOptions');
		//获取当前页
		var currpage = options.pageNumber;
		if (currpage == 0) {
			currpage = 1;
		}
		//获取当前页显示数据条数
		var pageSize = options.pageSize;
		data.currpage = currpage;
		data.pageSize = pageSize;
	}

	commonGridAjax("post", url, data, success, gridid, boolean);
}

//获取表格数据共通ajax方法，仅供内部调用
function commonGridAjax(type, url, data, success, gridid, boolean) {
	$.ajax({
		type : type,
		url : url,
		data : data,
		dataType : "json",
		success : function(response) {
			var result = response;
			//消息
			var errList = result.errList;
			//返回的消息类型
			var errType = result.errType;
			//后台有消息返回
			if (errList != undefined && errList.length != 0) {
				showErrMsgFromBack(errType, errList);//页面显示错误消息
				if (success != null && success != "commonCallback") {
					eval(success)(response);
				} else if (success == "commonCallback") {
					commonCallback(response, gridid, url, data, boolean);
				}
				return;
			} else {
				//如果回调函数=="commonCallback"则调用共通的回调函数，否则调用自定义回调函数
				if (success != null && success != "commonCallback") {
					eval(success)(response);
				} else if (success == "commonCallback") {
					commonCallback(response, gridid, url, data, boolean);
				}
			}
		},
		error : function(jqXHR, exception) {
			if (jqXHR.status === 0) {
				showOnlyMessage("error", "服务器停止运行，请与管理员联系");
			} 
			else if ((jqXHR.responseText).indexOf("登录：") > 0) {
				top.location.href = contextPath + "/logout";
			} else if ((jqXHR.responseText).indexOf("403") > 0) {
				top.location.href = contextPath + "/login/error?error=403";
			} else if ((jqXHR.responseText).indexOf("500") > 0) {
				top.location.href = contextPath + "/login/error?error=500";
			} else if (exception === 'parsererror') {

				showOnlyMessage("error", "json数据解析错误");
			} else if (exception === 'timeout') {
				showOnlyMessage("error", "请求超时，请重试");
			} else {
				showOnlyMessage("error", "系统异常，请与管理员联系");
			}
		}

	});
}

//共同回掉函数
//response:后台传回的数据
//gridid：表格控件的id
//boolean 是否需要分页条件
function commonCallback(response, gridid, url, data, boolean) {
	if (gridid != null && gridid != "") {
		$("#" + gridid).bootstrapTable('load', response);

		//db中数据被删除了，检索的后一页没有数据，页面显示前一页的数据
		if (response.rows.length == 0 && response.total > 0) {
			data.currpage = data.currpage - 1;
			commonGetrowdatas(gridid, data, url, "commonCallback", boolean);
		}
	}
}

//单独上传文件ajax共通方法
function ajaxFileUpload(type, url, id, success) {
	//执行上传文件操作的函数
	$.ajaxFileUpload({
		//处理文件上传操作的服务器端地址
		url : url,
		type : type,
		secureuri : false, //是否启用安全提交,默认为false
		fileElementId : id, //文件选择框的id属性
		dataType : "json", //服务器返回的格式,可以是json或xml等
		success : function(data, status) { //服务器响应成功时的处理函数
			//返回结果转化成json格式
			var result = data;
			//消息
			var errList = result.errList;
			//返回的消息类型
			var errType = result.errType;
			if (errList != undefined && errList.length != 0) {
				showErrMsgFromBack(errType, errList);
				if (success != null) {
					eval(success)(data);
				}
				return;
			} else {
				eval(success)(data);
			}
		},
		error : function(data, status, e) { //服务器响应失败时的处理函数
			showOnlyMessage("error", "系统错误，请与管理员联系！");
		}
	});
}
//非表格数据用ajax请求
//调用共同ajax方法，外部接口
function doAjax(type, url, data, success) {
	docommonAjax(type, url, data, success);
}

//ajax共同方法
function docommonAjax(type, url, data, success) {
	$.ajax({
		type : type,
		url : url,
		data : data,
		dataType : "json",
		success : function(response) {
			var result = response;
			//消息
			var errList = result.errList;
			//返回的消息类型
			var errType = result.errType;
			//后台有消息返回
			if (errList != undefined && errList.length != 0) {
				showErrMsgFromBack(errType, errList); //显示错误消息
				//回调函数
				eval(success)(response);
				return;
			} else {
				//回调函数
				eval(success)(response);
			}
		},
		error : function(jqXHR, exception) {
			if (jqXHR.status === 0) {
				showOnlyMessage("error", "服务器停止运行，请与管理员联系");
			} else if ((jqXHR.responseText).indexOf("登录：") > 0) {
				top.location.href = contextPath + "/logout";
			} else if ((jqXHR.responseText).indexOf("403") > 0) {
				top.location.href = contextPath + "/login/error?error=403";
			} else if ((jqXHR.responseText).indexOf("500") > 0) {
				top.location.href = contextPath + "/login/error?error=500";
			} else if (exception === 'parsererror') {

				showOnlyMessage("error", "json数据解析错误");
			} else if (exception === 'timeout') {
				showOnlyMessage("error", "请求超时，请重试");
			} else {
				showOnlyMessage("error", "系统异常，请与管理员联系");
			}

		}

	});
}

//弹出提示消息，供外部调用用接口
//消息内容是从js配置文件中获取
//@type 弹出消息类型
//消息类型分为error、info和warning三种类型
function showMessage(type, fromid) {
	if (main_Error_Array.length != 0) {
		//showErrMsg(type);
		showErrMsgLayer(type, fromid);
		return false;
	}
	return true;
}
//弹出提示消息
//不使用共通的check方式时弹出错误消息
function showOnlyMessage(type, message) {
	showParamMessage(type, message);
}

//弹出后台传回的消息消息
//供内部调用
function showErrMsgFromBack(type, errList) {
	var str = "";
	for ( var i = 0; i < errList.length; i++) {
		str += (errList[i] + "</br>");
	}
	//错误消息提示
	if (type == "error") {
		$.notify({
			icon : 'glyphicon glyphicon-remove-sign',
			title : '<strong>Error:</strong>',
			message : str
		}, {
			type : 'danger',
			placement : {
				from : "top",
				align : "center"
			}
		});
	}
	//消息提示
	else if (type == "info") {
		$.notify({
			icon : 'glyphicon glyphicon-ok-sign',
			title : '<strong>Info:</strong>',
			message : str
		}, {
			type : 'success',
			placement : {
				from : "top",
				align : "center"
			}
		});
	}
	//警告消息提示
	else if (type == "warning") {
		$.notify({
			icon : 'glyphicon glyphicon-warning-sign',
			title : '<strong>Warning:</strong>',
			message : str
		}, {
			type : 'warning',
			placement : {
				from : "top",
				align : "center"
			}
		});
	} else {
		$.notify({
			icon : 'glyphicon glyphicon-ok-sign',
			title : '<strong>Info:</strong>',
			message : str
		}, {
			type : 'success',
			placement : {
				from : "top",
				align : "center"
			}
		});
	}
}


//求出两个日期相差的天数
function DateDiff(sDate1, sDate2) { //sDate1和sDate2是yyyy-MM-dd格式

	var aDate, oDate1, oDate2, iDays;
	aDate = sDate1.split("-");
	oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]); //转换为yyyy-MM-dd格式
	aDate = sDate2.split("-");
	oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
	iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数

	return iDays; //返回相差天数
}

//获取表格选中的行数
function GetDataGridRows(id) {
	var rows = $('#' + id).bootstrapTable('getAllSelections').length;
	return rows;
}

//获取选表格中行
function GetSelectedRowsObj(id) {
	var rowsObj = $('#' + id).bootstrapTable('getSelections');
	return rowsObj;
}

//获取form中的数据，并将其转换成ajax需要的数据格式
function getFormJson(formId) {
	var o = {};
	var fid = "#" + formId;
	var a = $(fid).serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [ o[this.name] ];
			}
			o[this.name].push(this.value.trim() || '');
		} else {
			o[this.name] = this.value.trim() || '';
		}
	});
	return o;
}


function showConfirm(funName, msg, type, url, date, success) {
	bootbox.setLocale("zh_CN");
	bootbox.confirm(msg, function(result) {
		if (result) {
			eval(funName)(type, url, date, success);
		}
	});
}

//弹出提示消息
function showOnlyMessage(type, message) {
	showParamMessage(type, message);
}

//form表单中有file的form提交共通方法
//id:表单id,type:提交类型，get or post,url:提交路径,success:提交成功的回调函数
function doFileFormAjax(id, type, url, success) {
	$("#" + id).ajaxSubmit({
		type : type,
		url : url,
		data : $("#" + id).formSerialize(),
		dataType : "json",
		success : function(response) {
			//返回结果转化成json格式
			var result = response;
			//消息
			var errList = result.errList;
			//返回的消息类型
			var errType = result.errType;
			if (errList.length != 0) {
				showErrMsgFromBack(errType, errList);
				if (success != null) {
					eval(success)(response);
				}
				return;
			} else {
				eval(success)(response);
			}
		},
		error : function(jqXHR, exception) {
			if (jqXHR.status === 0) {
				showOnlyMessage("error", "服务器停止运行，请与管理员联系");
			} else if ((jqXHR.responseText).indexOf("登录：") > 0) {
				top.location.href = contextPath + "/logout";
			}else if ((jqXHR.responseText).indexOf("403") > 0) {
				top.location.href = contextPath + "/login/error?error=403";
			} else if ((jqXHR.responseText).indexOf("500") > 0) {
				top.location.href = contextPath + "/login/error?error=500";
			} else if (exception === 'parsererror') {

				showOnlyMessage("error", "json数据解析错误");
			} else if (exception === 'timeout') {
				showOnlyMessage("error", "请求超时，请重试");
			} else {
				showOnlyMessage("error", "系统异常，请与管理员联系");
			}

		}
	});
}

//对input框进行md5加密
function Encrypt(id) {
	if ($("#" + id).val() != null && $("#" + id).val() != "") {
		$("#" + id).val($.md5($("#" + id).val()));
	}

}

//获取checkboxtree所有选中的节点
function getSelectTree(treeId) {
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	var nodes = treeObj.getCheckedNodes(true);
	return nodes;
}

//比较开始日期和结束日期
function checkEndTime(startid,endid){  
    var startTime=$("#" + startid).val();  
    // var start=new Date(startTime.replace("-", "/").replace("-", "/"));
    var start=new Date(startTime); 
    var endTime=$("#"+endid).val();  
    // var end=new Date(endTime.replace("-", "/").replace("-", "/"));
    var end=new Date(endTime);  
    if(end<start){  
        return false;  
    }  
    return true;  
}