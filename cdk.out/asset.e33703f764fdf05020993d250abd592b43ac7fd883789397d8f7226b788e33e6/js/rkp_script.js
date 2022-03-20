(function () {
  'use strict'

  window.addEventListener('load', function () {
    var rkpforms = document.getElementsByClassName('needs-valid')
    Array.prototype.filter.call(rkpforms, function (rkpform) {
      rkpform.addEventListener('submit', function (event) {
        if (rkpform.checkValidity() === false) {
          event.preventDefault()
          event.stopPropagation()
        }
        rkpform.classList.add('was-valid')
      }, false)
    })
  }, false)
}());

(function () {
  window.addEventListener(
    "load", function () {
      const addStyleElm = document.querySelectorAll(".js-addstyle");

      const addStyleOption = {
        root: null,
        rootMargin: "0px 0px",
        threshold: 0,
      };

      const addStyleActive = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-active");
          }
        });
      };

      const addStyleObserver = new IntersectionObserver(addStyleActive, addStyleOption);

      addStyleElm.forEach((target) => {
        addStyleObserver.observe(target);
      });
    },
    false
  );
})();




document.addEventListener('DOMContentLoaded', function() {
  const MIN_HOUR = 60;
  const HOUR_DAY = 24;
  const MIN_DAY = 1440;
  const MIN_WEEK = 10080;
  const MIN_MONTH = 44640;
  const ROOP_TYPE = {"DAY":1,"WEEK":2,"MONTH":3,"NONE":0};
  function is_invalid_date(date){
    return isNaN(date.getTime());
  }
  function isArray(targetObject) {
    return (Object.prototype.toString.call(targetObject) === '[object Array]') ? true : false;
  }
  function getDateTime(dateObj) {
    if (!dateObj) return;
    if (typeof dateObj.getTime !== 'undefined') {
        return dateObj.getTime();
    } else if (isArray(dateObj)) {
        if (dateObj.length === 3) {
            return new Date(dateObj[0], Number(dateObj[1]) - 1, dateObj[2]).getTime();
        } else {
            return new Date(dateObj[0], Number(dateObj[1]) - 1, dateObj[2], dateObj[3], dateObj[4], dateObj[5]).getTime();
        }
    }

    return;
  }
  function getDiffMin(date1,date2){
    let diff_time = date1.getTime() - date2.getTime();
    // ミリ秒を分に変換
    return Math.floor(diff_time / (1000 * 60 ));
  }
  function is_between_hour(now,start,end){
    let currentminHour = now.getHours();
    let startminHour = start.getHours();
    let endminHour = end.getHours();
    //日付を跨ぐ場合は1日*60秒を加算して比較
    if (startminHour <= endminHour){
      return startminHour <= currentminHour && currentminHour < endminHour;
    }else{
      return currentminHour < endminHour || startminHour <= currentminHour;
    }
  }
  function is_between_date(now,start,end){
    if ( start <=  now && now < end ) {
      return true;
    }
    return false;
  }
  function dailyRoop(start,end,roop_end,now,roop_val_min){
    if ( start >  now||(roop_end&&!is_between_date(now,start,roop_end)) ) {
      return false;
    }
    if(roop_val_min >= MIN_DAY||is_between_hour(now,start,end)){
      //24時間以上の発火期間ならずっと発火
      return true;
    }
    return false;
  }
  function checkDateThisWeek(now,start,end,roop_val_min){
    let now_day_num = now.getDay();
    let start_day_num = start.getDay();
    let end_day_num = end.getDay();
    let start_week_diff = 0;//現在日と開始週への差分
    
    let this_year = now.getFullYear();
    let this_month = now.getMonth();
    let date = now.getDate();
      
    //同日チェック star〜endは同日か
    let is_same_day = (start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate());
    
    if(is_same_day){
        //開始と終了日が同日の場合
        if(now_day_num===start_day_num){
            //現在が開始曜日の時
            //時間帯範囲内かどうか
            let this_start_day =date - now.getDay() + start_day_num;
            let start_date = new Date(this_year, this_month, this_start_day,start.getHours());
            let end_date = new Date(this_year, this_month, this_start_day,start.getHours());
            end_date.setMinutes(end_date.getMinutes()+roop_val_min);
            return (is_between_hour(now,start_date,end_date));
        }
        return false;
    
    }else if(start_day_num===end_day_num){
        //開始と終了が別日だが、曜日は一緒の時(週跨ぎ)
        //前週の発火はあるか
        let last_start_day =(date-7) - now.getDay() + start_day_num;
        let last_start_date = new Date(this_year, this_month, last_start_day,start.getHours());
        let last_end_date = new Date(this_year, this_month, last_start_day,start.getHours());
        last_end_date.setMinutes(last_end_date.getMinutes()+roop_val_min);
        
        let this_start_day =date - now.getDay() + start_day_num;
        let start_date = new Date(this_year, this_month, this_start_day,start.getHours());
        let end_date = new Date(this_year, this_month, this_start_day,start.getHours());
        end_date.setMinutes(end_date.getMinutes()+roop_val_min);
        if(start.getTime()<=last_start_date.getTime()){
            //前週も発火対象日だったか
            return (is_between_date(now,start_date,end_date)||is_between_date(now,last_start_date,last_end_date));
        }else{
            return (is_between_date(now,start_date,end_date));
        }
      
        
        //前週または今週の発火期間内か
    }else if(start_day_num <end_day_num){
        //週をまたがいない時(日(0)〜水(3)など)
        let this_start_day =date - now.getDay() + start_day_num;
        let start_date = new Date(this_year, this_month, this_start_day,start.getHours());
        let end_date = new Date(this_year, this_month, this_start_day,start.getHours());
        end_date.setMinutes(end_date.getMinutes()+roop_val_min);
    
        return (is_between_date(now,start_date,end_date));
    }else if(start_day_num > end_day_num){
        //週を跨ぐ時(土(6)〜金(5)など)
        //現在日が開始曜日と別の週にある時(現在が月(1),開始が土(6の時は先週))
        start_week_diff = (start_day_num > now_day_num)? -7 :0;
        
        let this_start_day =(date+start_week_diff) - now.getDay() + start_day_num;
        let start_date = new Date(this_year, this_month, this_start_day,start.getHours());
        let end_date = new Date(this_year, this_month, this_start_day,start.getHours());
        end_date.setMinutes(end_date.getMinutes()+roop_val_min);
    
        return (is_between_date(now,start_date,end_date));
    }
  }
  function weeklyRoop(start,end,roop_end,now,roop_val_min){
    if ( start >  now ||(roop_end&&!is_between_date(now,start,roop_end))){
      return false;
    }
    if(roop_val_min >= MIN_WEEK ){
      return true;
    }
    return checkDateThisWeek(now,start,end,roop_val_min);
  }
  function checkDateThisYear(now,start,end,roop_val_min){
    let this_year = now.getFullYear();
    let this_month = now.getMonth();
    let dateFrom = start.getDate();
    let start_date = new Date(this_year, this_month,dateFrom,start.getHours());
    let end_date = new Date(this_year, this_month,dateFrom,start.getHours());
    end_date.setMinutes(end_date.getMinutes()+roop_val_min);
    let dateTo = end_date.getDate();
    if(is_between_date(now,start_date,end_date)){
      return true;
    }
    start_date.setDate(0);
    start_date.setDate(dateFrom);
    end_date.setDate(0);
    end_date.setDate(dateTo);
    if(is_between_date(now,start_date,end_date)){
      return true;
    }
    return false;
  }
  function monthlyRoop(start,end,roop_end,now,roop_val_min){
    if ( start >  now ||(roop_end&&!is_between_date(now,start,roop_end))){
    return false;
    }
    if(roop_val_min >= MIN_MONTH){
      return true;
    }
    return checkDateThisYear(now,start,end,roop_val_min);
  }
  function roopCheck(type,start,end,roop_end,now,roop_val_min){
    if(!type||is_invalid_date(start)||is_invalid_date(end)) return false;
    switch(type){
      case ROOP_TYPE["DAY"]:
      return dailyRoop(start,end,roop_end,now,roop_val_min);
      case ROOP_TYPE["WEEK"]:
      return weeklyRoop(start,end,roop_end,now,roop_val_min);
      case ROOP_TYPE["MONTH"]:
      return monthlyRoop(start,end,roop_end,now,roop_val_min);
      default :
      return false;
    }
  }
  function toggleBlock(start_time,end_time,roop_end,is_all_day,roop_type,roop_val_min,now){
    let start = is_invalid_date(start_time)?now:start_time;
    let end = end_time;
    roop_end = (is_invalid_date(start_time)||is_invalid_date(roop_end))?"":roop_end;

    // else{
    //   end_time.setSeconds(end_time.getSeconds() - 1);
    // }
    
    if(roop_type===ROOP_TYPE["NONE"]){
    if(is_invalid_date(end_time)){
      //終了日がない時はずっと発火
      end = new Date(now.getTime());
      end.setMinutes(end.getMinutes() + 60);
    }
      return is_between_date(now,start,end);
    }

    // if(roop_end){
    //   roop_end.setSeconds(roop_end.getSeconds() - 1);
    // }
    if(!roopCheck(roop_type,start,end,roop_end,now,roop_val_min)) return false;
    return true;
  }


    let now = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    if(typeof SETTING !== 'undefined'&&SETTING.switchBlockEvents){
    Object.keys(SETTING.switchBlockEvents).forEach(function (key) {
      let arr=SETTING.switchBlockEvents[key];
      let $from_block=(key&&document.getElementById(key))?document.getElementById(key):false;
      for(let i=0;i<arr.length;i++){
        let targ =(arr[i]["TARGET"]&&document.getElementById(arr[i]["TARGET"]))?document.getElementById(arr[i]["TARGET"]):false;
        let is_switch =toggleBlock(new Date(arr[i]["FROM"].replace(/-/g,"/")),new Date(arr[i]["TO"].replace(/-/g,"/")),new Date(arr[i]["ROOPEND"].replace(/-/g,"/")),arr[i]["ALLDAY"],arr[i]["ROOP"],arr[i]["DURATION"],now);
        if($from_block&&is_switch){
          $from_block.classList.add( "view-cloak" );
        }else if(targ && !is_switch){
          targ.classList.add( "view-cloak" );
        }
      }
    });
  }
});