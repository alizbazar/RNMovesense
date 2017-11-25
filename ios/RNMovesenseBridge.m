//
//  RNMovesenseBridge.m
//  RNMovesense
//
//  Created by Albert Nazander on 25/11/2017.
//

#import <Foundation/Foundation.h>

#import "RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNMovesense, NSObject)

RCT_EXTERN_METHOD(addEvent:(NSString *)name location:(NSString *)location)
RCT_EXTERN_METHOD(initialize)
//RCT_EXTERN_METHOD(startScan)
RCT_EXTERN_METHOD(startListening)
RCT_EXTERN_METHOD(stopListening)
RCT_EXTERN_METHOD(supportedEvents)
  
@end
