class Utils {
    constructor(){}
    static CalculateDistanceAndAngle(x1,y1,x2,y2){
        [x2,y2]=Utils.GetLoopingDistance(x1, y1, x2, y2);
        let dx = x2 - x1;
        let dy = y2 - y1;
        return [Math.sqrt((dx * dx) + (dy * dy)), Math.atan2(dx, -dy)];
    }

    static GetLoopingDistance(x1,y1,x2,y2){
        let looped_x2=x2, looped_y2=y2;
        
        if ((x2 - x1) > (width / 2.0)) looped_x2 = x2 - width;
        else if((x2 - x1) < -(width / 2.0)) looped_x2 = x2 + width;
        
        if ((y2 - y1) > (height / 2.0)) looped_y2 = y2 - height;
        else if((y2 - y1) < -(height / 2.0)) looped_y2 = y2 - height;
        
        return [looped_x2, looped_y2];
    }
}